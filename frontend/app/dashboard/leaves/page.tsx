"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/shared/ui/Card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shared/ui/Tabs";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { SystemRole } from "@/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { leavesApi } from "@/lib/api/leaves/leaves";
import { LeaveRequest } from "@/types/leaves";

export default function LeavesPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [delegatedPendingRequests, setDelegatedPendingRequests] = useState<LeaveRequest[]>([]);
  const [loadingDelegatedRequests, setLoadingDelegatedRequests] = useState(false);

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is HR Admin, HR Manager, Department Head, or Payroll Manager
  useEffect(() => {
    // Wait for mount and auth initialization
    if (!mounted || loading) return;
    
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    
    if (user) {
      const roles = user.roles || [];
      const isHRAdmin = roles.includes(SystemRole.HR_ADMIN);
      const isHRManager = roles.includes(SystemRole.HR_MANAGER);
      const isDepartmentHead = roles.includes(SystemRole.DEPARTMENT_HEAD);
      const isPayrollManager = roles.includes(SystemRole.PAYROLL_MANAGER);
      
      if (!isHRAdmin && !isHRManager && !isDepartmentHead && !isPayrollManager) {
        // Redirect employees to the employee-facing leave page
        router.replace("/dashboard/leaves/requests");
        return;
      }
    }
  }, [mounted, loading, isAuthenticated, user, router]);

  // Fetch pending requests for delegates
  useEffect(() => {
    const fetchDelegatedRequests = async () => {
      // IMPORTANT: always prefer employee profile _id to match backend delegation logic
      const userId = (user as any)?._id || user?.userId || (user as any)?.id;
      if (!userId) return;

      // Only HR Manager / HR Admin should see the delegated banner here.
      // Department Heads already review team requests in their own section.
      const roles = user?.roles || [];
      const isHRAdmin = roles.includes(SystemRole.HR_ADMIN);
      const isHRManager = roles.includes(SystemRole.HR_MANAGER);
      if (!isHRAdmin && !isHRManager) {
        // For Department Heads and others, do not show delegated list on this dashboard.
        setDelegatedPendingRequests([]);
        return;
      }

      setLoadingDelegatedRequests(true);
      try {
        // Call with userId to check if user is a delegate
        // The backend will return team requests if user is a delegate
        const requests = await leavesApi.getEmployeeLeaveRequests(userId, {
          status: "pending",
        });

        // Only keep pending requests that do NOT belong to the current user
        const normalizedUserId = userId.toString();
        const pendingOnly = requests.filter((req) => {
          if (req.status?.toLowerCase() !== "pending") return false;

          // Normalize employeeId from the request (can be string or populated object)
          const rawEmployeeId: any = (req as any).employeeId;
          let employeeIdStr: string | null = null;

          if (typeof rawEmployeeId === "string") {
            employeeIdStr = rawEmployeeId;
          } else if (rawEmployeeId && typeof rawEmployeeId === "object") {
            employeeIdStr =
              (rawEmployeeId as any)._id ||
              (rawEmployeeId as any).id ||
              (typeof rawEmployeeId.toString === "function"
                ? rawEmployeeId.toString()
                : null);
          }

          // Exclude the HR Manager's own requests from the delegated list
          if (employeeIdStr && employeeIdStr === normalizedUserId) {
            return false;
          }

          return true;
        });

        setDelegatedPendingRequests(pendingOnly);
      } catch (error: any) {
        console.error("Error fetching delegated requests:", error);
        // If error, user might not be a delegate, which is fine
        setDelegatedPendingRequests([]);
      } finally {
        setLoadingDelegatedRequests(false);
      }
    };

    if (isAuthenticated && user) {
      fetchDelegatedRequests();
    }
  }, [isAuthenticated, user]);

  // Only show admin page if user is HR Admin, HR Manager, Department Head, or Payroll Manager
  const roles = user?.roles || [];
  const isHRAdmin = roles.includes(SystemRole.HR_ADMIN);
  const isHRManager = roles.includes(SystemRole.HR_MANAGER);
  const isDepartmentHead = roles.includes(SystemRole.DEPARTMENT_HEAD);
  const isPayrollManager = roles.includes(SystemRole.PAYROLL_MANAGER);

  // Show loading while checking authentication or if user doesn't have required role
  // Wait for mounted to avoid hydration mismatch
  if (!mounted || loading || !isAuthenticated || (!isHRAdmin && !isHRManager && !isDepartmentHead && !isPayrollManager)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leaves Management</h1>
        <p className="text-gray-600 mt-1">Configure and manage leave policies, types, and entitlements</p>
      </div>

      {/* Tabs for Quick Access */}
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className={`grid w-full ${
          delegatedPendingRequests.length > 0 
            ? 'grid-cols-2' 
            : 'grid-cols-1'
        }`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {delegatedPendingRequests.length > 0 && (
            <TabsTrigger value="delegated" className="relative">
              Delegated Requests
              <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full">
                {delegatedPendingRequests.length}
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Only show for non-HR Admin users (HR Admin has their own section below) */}
            {!isHRAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Leave Requests</CardTitle>
                  <CardDescription>View and manage your leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    href="/dashboard/leaves/requests" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View & Create Requests →
                  </Link>
                </CardContent>
              </Card>
            )}
            {isDepartmentHead && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Review team leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    href="/dashboard/leaves/requests/review" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Review Pending Requests →
                  </Link>
                </CardContent>
              </Card>
            )}
            {isHRManager && (
              <Card>
                <CardHeader>
                  <CardTitle>HR Management</CardTitle>
                  <CardDescription>Finalize and manage leave requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link 
                    href="/dashboard/leaves/hr-manager" 
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Manage Requests →
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="delegated" className="mt-6">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Delegated Pending Requests</CardTitle>
              <CardDescription className="text-orange-700">
                You have been delegated to review and approve these leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDelegatedRequests ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading pending requests...</p>
                </div>
              ) : delegatedPendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No delegated pending requests at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {delegatedPendingRequests.map((request) => {
                    const leaveTypeName = (request as any).leaveTypeName ||
                      (typeof request.leaveTypeId === "object" && request.leaveTypeId !== null
                        ? request.leaveTypeId.name
                        : "Unknown Leave Type");
                    
                    return (
                      <div
                        key={request._id}
                        className="p-4 bg-white rounded-lg border border-orange-200 hover:border-orange-300 transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/leaves/requests/review?employeeId=${request.employeeId}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              Leave Request #{request._id.slice(-8)}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">{leaveTypeName}</span> • {request.durationDays} day{request.durationDays !== 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {request.dates?.from && new Date(request.dates.from).toLocaleDateString()} - {request.dates?.to && new Date(request.dates.to).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            PENDING
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <Link
                    href="/dashboard/leaves/requests/review"
                    className="block mt-4 text-center text-orange-600 hover:underline font-medium"
                  >
                    View All Delegated Requests →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Department Head Section */}
      {isDepartmentHead && (
        <div className="mb-6 space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Manager Actions</CardTitle>
              <CardDescription className="text-blue-700">
                Review and approve leave requests from your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link 
                  href="/dashboard/leaves/requests" 
                  className="block text-blue-600 hover:underline font-medium"
                >
                  View & Create Leave Requests →
                </Link>
                <Link 
                  href="/dashboard/leaves/requests/review" 
                  className="block text-blue-600 hover:underline font-medium"
                >
                  Review Pending Leave Requests →
                </Link>
                <Link 
                  href="/dashboard/leaves/team-balances" 
                  className="block text-blue-600 hover:underline font-medium"
                >
                  View Team Leave Balances →
                </Link>
                <Link 
                  href="/dashboard/leaves/team-management" 
                  className="block text-blue-600 hover:underline font-medium"
                >
                  Manage Team Leave Data →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* HR Manager Section - Only for HR_MANAGER (HR_ADMIN excluded) */}
      {isHRManager && !isHRAdmin && (
        <div className="mb-6 space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">HR Manager Actions</CardTitle>
              <CardDescription className="text-blue-700">
                Finalize approved requests, override decisions, and process requests in bulk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link 
                  href="/dashboard/leaves/requests" 
                  className="block text-blue-600 hover:underline font-medium"
                >
                  View & Create Leave Requests →
                </Link>
                <Link 
                  href="/dashboard/leaves/hr-manager" 
                  className="block text-blue-600 hover:underline font-medium"
                >
                  Manage Leave Requests →
                </Link>
                <Link 
                  href="/dashboard/leaves/accrual-adjustment" 
                  className="block text-blue-600 hover:underline font-medium"
                >
                  Accrual Adjustment →
                </Link>
                <Link 
                  href="/dashboard/leaves/accrual" 
                  className="block text-blue-600 hover:underline font-medium"
                >
                  Manual Accrual Management →
                </Link>
                <Link 
                  href="/dashboard/leaves/carry-forward" 
                  className="block text-blue-600 hover:underline font-medium"
                >
                  Manual Carry-Forward Management →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payroll Manager Section */}
      {isPayrollManager && (
        <div className="mb-6 space-y-4">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-900">Payroll Manager Actions</CardTitle>
              <CardDescription className="text-purple-700">
                View team leave balances, manage team leave data, and review/approve leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link 
                  href="/dashboard/leaves/requests" 
                  className="block text-purple-600 hover:underline font-medium"
                >
                  View & Create Leave Requests →
                </Link>
                <Link 
                  href="/dashboard/leaves/requests/review" 
                  className="block text-purple-600 hover:underline font-medium"
                >
                  Review & Approve Team Requests →
                </Link>
                <Link 
                  href="/dashboard/leaves/team-balances" 
                  className="block text-purple-600 hover:underline font-medium"
                >
                  View Team Leave Balances →
                </Link>
                <Link 
                  href="/dashboard/leaves/team-management" 
                  className="block text-purple-600 hover:underline font-medium"
                >
                  Manage Team Leave Data →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* HR Admin Section */}
      {isHRAdmin && (
        <div className="mb-6 space-y-4">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-900">HR Admin Actions</CardTitle>
              <CardDescription className="text-purple-700">
                Manage your leave requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link 
                  href="/dashboard/leaves/requests" 
                  className="block text-purple-600 hover:underline font-medium"
                >
                  View & Create Leave Requests →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* HR Admin Admin Tools Grid */}
      {isHRAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <Card>
            <CardHeader>
              <CardTitle>Leave Types</CardTitle>
              <CardDescription>Manage leave types (Annual, Sick, etc.)</CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                href="/dashboard/leaves/types" 
                className="text-blue-600 hover:underline font-medium"
              >
                Manage Leave Types →
              </Link>
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Categories</CardTitle>
            <CardDescription>Organize leave types into categories</CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/dashboard/leaves/categories" 
              className="text-blue-600 hover:underline font-medium"
            >
              Manage Categories →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Policies</CardTitle>
            <CardDescription>Configure accrual rates, carry-over, and eligibility rules</CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/dashboard/leaves/policies" 
              className="text-blue-600 hover:underline font-medium"
            >
              Manage Policies →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Entitlements</CardTitle>
            <CardDescription>Assign and manage employee leave entitlements</CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/dashboard/leaves/entitlements" 
              className="text-blue-600 hover:underline font-medium"
            >
              Manage Entitlements →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Adjustments</CardTitle>
            <CardDescription>Manually adjust employee leave balances</CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/dashboard/leaves/adjustments" 
              className="text-blue-600 hover:underline font-medium"
            >
              Manage Adjustments →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar & Blocked Days</CardTitle>
            <CardDescription>Configure holidays and blocked periods</CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/dashboard/leaves/calendar" 
              className="text-blue-600 hover:underline font-medium"
            >
              Manage Calendar →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reset Leave Balances</CardTitle>
            <CardDescription>Reset leave balances for the new year</CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/dashboard/leaves/reset" 
              className="text-blue-600 hover:underline font-medium"
            >
              Reset Balances →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auto Accrual Management</CardTitle>
            <CardDescription>Automated accrual runs daily. Manual override available to HR Manager.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              Accrual runs automatically based on policy settings (monthly/yearly/per-term).
            </p>
            <p className="text-xs text-gray-500">
              Scheduled: Daily at 2 AM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carry-Forward Management</CardTitle>
            <CardDescription>Automated carry-forward runs daily. Manual override available to HR Manager.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              Carry-forward runs automatically when reset dates are reached.
            </p>
            <p className="text-xs text-gray-500">
              Scheduled: Daily at 3 AM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accrual Adjustment</CardTitle>
            <CardDescription>Adjust accruals during unpaid leave or long absence</CardDescription>
          </CardHeader>
          <CardContent>
            <Link 
              href="/dashboard/leaves/accrual-adjustment" 
              className="text-blue-600 hover:underline font-medium"
            >
              Manage Adjustments →
            </Link>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Employee Section - Only show for regular employees (not managers/HR/Payroll) */}
      {!isHRAdmin && !isHRManager && !isDepartmentHead && !isPayrollManager && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Employee Actions</CardTitle>
            <CardDescription className="text-green-700">
              View your leave balance and manage your leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link 
                href="/dashboard/leaves/requests/new" 
                className="block text-green-600 hover:underline font-medium"
              >
                Create Leave Request →
              </Link>
              <Link 
                href="/dashboard/leaves/balance" 
                className="block text-green-600 hover:underline font-medium"
              >
                View My Leave Balance →
              </Link>
              <Link 
                href="/dashboard/leaves/requests" 
                className="block text-green-600 hover:underline font-medium"
              >
                My Leave Requests →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Leave Request - Show for all roles that can create requests (including HR Admin, Payroll, Finance, Legal, etc.) */}
      {(() => {
        const roles = user?.roles || [];
        const canCreateRequest = [
          SystemRole.DEPARTMENT_EMPLOYEE,
          SystemRole.DEPARTMENT_HEAD,
          SystemRole.HR_MANAGER,
          SystemRole.HR_EMPLOYEE,
          SystemRole.PAYROLL_SPECIALIST,
          SystemRole.PAYROLL_MANAGER,
          SystemRole.SYSTEM_ADMIN,
          SystemRole.LEGAL_POLICY_ADMIN,
          SystemRole.FINANCE_STAFF,
          SystemRole.HR_ADMIN,
        ].some(role => roles.includes(role));

        // Only show if user can create requests and hasn't seen it in another section
        if (canCreateRequest && !isDepartmentHead && !isHRManager && !isHRAdmin && !isPayrollManager) {
          return (
            <Card className="mb-6 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-900">Create Leave Request</CardTitle>
                <CardDescription className="text-purple-700">
                  Submit a new leave request for approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link 
                  href="/dashboard/leaves/requests/new" 
                  className="block text-purple-600 hover:underline font-medium text-lg"
                >
                  Create New Leave Request →
                </Link>
              </CardContent>
            </Card>
          );
        }
        return null;
      })()}
    </div>
  );
}