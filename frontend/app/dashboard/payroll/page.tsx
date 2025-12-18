"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useRequireAuth } from "@/lib/hooks/use-auth";
import { SystemRole } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shared/ui/Card";
import { Button } from "@/components/shared/ui/Button";

export default function PayrollManagerDashboardPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  
  // Debug: Log user roles to help diagnose issues
  useEffect(() => {
    if (user) {
      console.log("Payroll Page - User roles:", user.roles);
      console.log("Payroll Page - User:", user);
    }
  }, [user]);
  
  // Allow employees, payroll specialists, payroll managers, finance staff, and system admins
  // For Payroll Manager specifically, use stricter auth
  const isPayrollManager = user?.roles?.includes(SystemRole.PAYROLL_MANAGER);
  const { isLoading: isAuthLoading } = useRequireAuth(
    isPayrollManager 
      ? SystemRole.PAYROLL_MANAGER 
      : [
          SystemRole.DEPARTMENT_EMPLOYEE,
          SystemRole.PAYROLL_SPECIALIST,
          SystemRole.PAYROLL_MANAGER,
          SystemRole.FINANCE_STAFF,
          SystemRole.SYSTEM_ADMIN
        ]
  );


  // Show loading state while checking authentication
  // Don't render until auth is fully checked to prevent redirect flicker
  if (loading || isAuthLoading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Double-check that user has the required role before rendering
  const hasPayrollManagerRole = user?.roles?.includes(SystemRole.PAYROLL_MANAGER);
  const hasPayrollAccess = user?.roles?.some(
    (role) =>
      role === SystemRole.PAYROLL_SPECIALIST ||
      role === SystemRole.PAYROLL_MANAGER ||
      role === SystemRole.FINANCE_STAFF ||
      role === SystemRole.SYSTEM_ADMIN ||
      role === SystemRole.DEPARTMENT_EMPLOYEE
  );

  if (!hasPayrollAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // If Payroll Manager, show the full dashboard with leave management
  if (hasPayrollManagerRole) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Payroll Manager Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome, {user?.fullName || "Manager"}. Manage payroll operations.
          </p>
        </div>

        {/* Payroll Operations Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Payroll Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200">
              <CardHeader>
                <CardTitle>Payroll Configuration</CardTitle>
                <CardDescription>
                  Configure pay grades, tax rules, and payroll settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/dashboard/payroll-configuration"
                  className="block w-full text-center bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition font-medium"
                >
                  Manage Configuration
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-2 border-green-200">
              <CardHeader>
                <CardTitle>Payroll Tracking</CardTitle>
                <CardDescription>
                  View payslips, claims, disputes, and refunds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="/dashboard/payroll-tracking"
                  className="block w-full text-center bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition font-medium"
                >
                  View Payroll
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // For other payroll roles (not Payroll Manager), show the selection page
  // COMMENTED OUT: Original PayrollSelectionPage implementation preserved below
  /*
  export default function PayrollSelectionPage() {
    // This was the original implementation for non-manager payroll roles
    // Keeping it commented for reference
  }
  */
  
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
        <p className="text-gray-600 mt-1">Select a payroll module to access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payroll Configuration */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">⚙</div>
              <CardTitle className="text-xl">Payroll Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure payroll settings, pay grades, and payroll rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Manage pay grades, allowances, deductions, tax rules, and other payroll configurations.
            </p>
            <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push("/dashboard/payroll-configuration"); }}>
              Go to Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Payroll Execution */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">💼</div>
              <CardTitle className="text-xl">Payroll Execution</CardTitle>
            </div>
            <CardDescription>
              Execute payroll runs and process payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Create payroll runs, calculate salaries, generate payslips, and process payments.
            </p>
            <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push("/dashboard/payroll-execution"); }}>
              Go to Execution
            </Button>
          </CardContent>
        </Card>

        {/* Payroll Tracking */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">📊</div>
              <CardTitle className="text-xl">Payroll Tracking</CardTitle>
            </div>
            <CardDescription>
              View payslips, track claims, disputes, and refunds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Access your payslips, submit expense claims, dispute payroll errors, and track reimbursement status.
            </p>
            <Button className="w-full" onClick={(e) => { e.stopPropagation(); router.push("/dashboard/payroll-tracking"); }}>
              Go to Tracking
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
