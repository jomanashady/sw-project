"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { SystemRole } from "@/types";
import { payrollExecutionApi } from "@/lib/api/payroll-execution/payroll-execution";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shared/ui/Card";
import { Button } from "@/components/shared/ui/Button";
import {
  RefreshCw,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Building2,
  Eye,
  Search,
  AlertCircle,
} from "lucide-react";

interface PayrollRun {
  _id: string;
  runId: string;
  payrollPeriod: string;
  status: string;
  entity: string;
  employees: number;
  totalnetpay: number;
  exceptions?: number;
  createdAt?: string;
  paymentStatus?: string;
}

export default function ReviewPayrollRunsPage() {
  const router = useRouter();
  const { user } = useAuth();
  useRequireAuth([
    SystemRole.PAYROLL_SPECIALIST,
    SystemRole.PAYROLL_MANAGER,
    SystemRole.FINANCE_STAFF,
  ]);

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [filteredRuns, setFilteredRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchPayrollRuns();
  }, []);

  useEffect(() => {
    filterRuns();
  }, [payrollRuns, searchTerm, statusFilter]);

  const fetchPayrollRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const runsResponse = await payrollExecutionApi.getAllPayrollRuns({
        limit: 1000,
      });

      let runsData: any[] = [];
      if (Array.isArray(runsResponse)) {
        runsData = runsResponse;
      } else if (Array.isArray((runsResponse as any)?.data)) {
        runsData = (runsResponse as any).data;
      } else if (Array.isArray((runsResponse as any)?.data?.items)) {
        runsData = (runsResponse as any).data.items;
      }

      setPayrollRuns(runsData);
    } catch (err: any) {
      setError(err.message || "Failed to load payroll runs");
      console.error("Error fetching payroll runs:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterRuns = () => {
    let filtered = payrollRuns;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((run) => {
        const status = run.status?.toLowerCase()?.trim() || "";
        return status === statusFilter.toLowerCase();
      });
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (run) =>
          run.runId.toLowerCase().includes(searchLower) ||
          run.entity.toLowerCase().includes(searchLower) ||
          formatDate(run.payrollPeriod).toLowerCase().includes(searchLower) ||
          run.status.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    setFilteredRuns(filtered);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase()?.trim() || "";
    
    if (statusLower === "draft") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
          Draft
        </span>
      );
    } else if (statusLower === "under review" || statusLower === "under_review") {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
          Under Review
        </span>
      );
    } else if (statusLower === "approved") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          Approved
        </span>
      );
    } else if (statusLower === "rejected") {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
          Rejected
        </span>
      );
    } else if (statusLower === "locked" || statusLower === "frozen") {
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
          Locked
        </span>
      );
    } else if (statusLower === "pending finance approval" || statusLower === "pending_finance_approval") {
      return (
        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
          Pending Finance Approval
        </span>
      );
    } else if (statusLower === "pending manager approval" || statusLower === "pending_manager_approval") {
      return (
        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
          Pending Manager Approval
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
        {status || "Unknown"}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus) return null;
    const statusLower = paymentStatus.toLowerCase();
    
    if (statusLower === "paid") {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Paid
        </span>
      );
    } else if (statusLower === "pending") {
      return (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
          Pending
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
        {paymentStatus}
      </span>
    );
  };

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(
    new Set(payrollRuns.map((run) => run.status?.toLowerCase()?.trim() || "unknown"))
  ).filter((s) => s !== "unknown");

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Review Payroll Runs</h1>
        <p className="text-gray-600 mt-1">
          View and manage all payroll runs. Click on any run to view detailed information.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by run ID, entity, period, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Loading payroll runs...</p>
          </CardContent>
        </Card>
      ) : filteredRuns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {searchTerm || statusFilter !== "all"
                ? "No payroll runs match your filters"
                : "No payroll runs found"}
            </p>
            <p className="text-gray-500 text-sm">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Process a new payroll initiation to see it here."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button
                onClick={() => router.push("/dashboard/payroll-execution/process-initiation")}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Process New Initiation
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredRuns.length} of {payrollRuns.length} payroll runs
            </p>
            <Button
              onClick={fetchPayrollRuns}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {filteredRuns.map((run) => (
            <Card key={run._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      {run.runId}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Payroll Period: {formatDate(run.payrollPeriod)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(run.status)}
                    {getPaymentStatusBadge(run.paymentStatus)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Period</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(run.payrollPeriod)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Building2 className="h-4 w-4" />
                      <span className="text-sm">Entity</span>
                    </div>
                    <p className="font-semibold text-gray-900">{run.entity}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Employees</span>
                    </div>
                    <p className="font-semibold text-gray-900">{run.employees || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Total Net Pay</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(run.totalnetpay)}
                    </p>
                  </div>
                </div>

                {run.exceptions && run.exceptions > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      <strong>{run.exceptions}</strong> irregularit{run.exceptions === 1 ? "y" : "ies"} detected
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button
                    onClick={() => router.push(`/dashboard/payroll-execution/preview?payrollRunId=${run._id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button
          onClick={() => router.push("/dashboard/payroll-execution")}
          variant="outline"
        >
          ← Back to Payroll Execution Dashboard
        </Button>
      </div>
    </div>
  );
}

