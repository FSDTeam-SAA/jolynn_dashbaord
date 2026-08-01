"use client";

import React, { useState } from "react";
import { Ban, Eye, Loader2, Mail, Trash2 } from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import ViewReport from "./ViewReport";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import SuspendUserModal from "./SuspendUserModal";

export type ReportType = "report" | "job-report";

type ServiceReport = {
  _id: string;
  userId?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  };
  ownerId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email?: string;
    phoneNumber?: string;
  };
  services?: Array<{ _id?: string; title?: string; description?: string }>;
  message: string;
  createdAt: string;
};

type JobReport = {
  _id: string;
  helpWantedId?: {
    username?: string;
    email?: string;
    phone?: string;
    category?: string;
    zipcode?: string;
    message?: string;
    userId?: string;
  };
  userId: string;
  message: string;

  createdAt: string;
};

type ListResponse<T> = {
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: T[];
};

type TableRow = {
  id: string;
  username: string;
  email: string;
  contact: string;
  report: string;
  suspendUserId?: string;
  suspendUserName: string;
};

export default function ReportManagementList() {
  const [activeTab, setActiveTab] = useState<ReportType>("report");
  const [reportPage, setReportPage] = useState(1);
  const [jobReportPage, setJobReportPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<{
    id: string;
    type: ReportType;
  } | null>(null);
  const [reportToDelete, setReportToDelete] = useState<
    (TableRow & { type: ReportType }) | null
  >(null);
  const [userToSuspend, setUserToSuspend] = useState<Pick<
    TableRow,
    "suspendUserId" | "suspendUserName"
  > | null>(null);
  const limit = 10;
  const { data: session, status: sessionStatus } = useSession();
  const sessionUser = session?.user as
    | { accessToken?: string; token?: string }
    | undefined;
  const accessToken = sessionUser?.accessToken ?? sessionUser?.token;
  const queryClient = useQueryClient();

  const reportsQuery = useQuery<ListResponse<ServiceReport>>({
    queryKey: ["reports", reportPage, accessToken],
    queryFn: () =>
      fetchReports<ServiceReport>("report", reportPage, limit, accessToken),
    enabled: Boolean(accessToken) && activeTab === "report",
  });
  const jobReportsQuery = useQuery<ListResponse<JobReport>>({
    queryKey: ["jobReports", jobReportPage, accessToken],
    queryFn: () =>
      fetchReports<JobReport>("job-report", jobReportPage, limit, accessToken),
    enabled: Boolean(accessToken) && activeTab === "job-report",
  });

  const isServiceReport = activeTab === "report";
  const activeResponse = isServiceReport
    ? reportsQuery.data
    : jobReportsQuery.data;
  const isLoading =
    sessionStatus === "loading" ||
    (isServiceReport ? reportsQuery.isPending : jobReportsQuery.isPending);
  const activeError = isServiceReport
    ? reportsQuery.error
    : jobReportsQuery.error;
  const page = isServiceReport ? reportPage : jobReportPage;
  const setPage = isServiceReport ? setReportPage : setJobReportPage;
  const rows: TableRow[] = isServiceReport
    ? (reportsQuery.data?.data ?? []).map((item) => ({
        id: item._id,
        username:
          [item.userId?.firstName, item.userId?.lastName]
            .filter(Boolean)
            .join(" ") || "Unknown user",
        email: item.userId?.email || "N/A",
        contact: item.userId?.phoneNumber || "N/A",
        report: item.message,
        suspendUserId: item.ownerId?._id,
        suspendUserName:
          item.ownerId?.businessName ||
          [item.ownerId?.firstName, item.ownerId?.lastName]
            .filter(Boolean)
            .join(" ") ||
          item.ownerId?.email ||
          "this business owner",
      }))
    : (jobReportsQuery.data?.data ?? []).map((item) => ({
        id: item._id,
        username: item.helpWantedId?.username || "Unknown user",
        email: item.helpWantedId?.email || "N/A",
        contact: item.helpWantedId?.phone || "N/A",
        report: item.message,
        suspendUserId: item.helpWantedId?.userId,
        suspendUserName: item.helpWantedId?.username || "this job post owner",
      }));

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: ReportType }) => {
      if (!accessToken) throw new Error("You are not authorized.");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/${type}/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete report");
      }
      return data;
    },
    onSuccess: async (data, deletedReport) => {
      toast.success(data?.message || "Report deleted successfully");
      setReportToDelete(null);
      if (selectedReport?.id === deletedReport.id) setSelectedReport(null);
      if (rows.length === 1 && page > 1) setPage((current) => current - 1);
      await queryClient.invalidateQueries({
        queryKey: [deletedReport.type === "report" ? "reports" : "jobReports"],
      });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const suspendMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!accessToken) throw new Error("You are not authorized.");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${encodeURIComponent(userId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: "suspended" }),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        const errorMessage = Array.isArray(data?.message)
          ? data.message[0]
          : data?.message;
        throw new Error(errorMessage || "Failed to update user status");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "User suspended successfully");
      setUserToSuspend(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
        <div className="grid w-full grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-[390px]">
          <button
            type="button"
            onClick={() => setActiveTab("report")}
            className={`relative w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === "report" ? "bg-[linear-gradient(135deg,#2b3674_0%,#4365D0_100%)] text-white shadow-md shadow-[#2b3674]/20" : "text-gray-500 hover:bg-[#eef2ff] hover:text-[#2b3674]"}`}
          >
            Business Reports
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("job-report")}
            className={`relative w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === "job-report" ? "bg-[linear-gradient(135deg,#2b3674_0%,#4365D0_100%)] text-white shadow-md shadow-[#2b3674]/20" : "text-gray-500 hover:bg-[#eef2ff] hover:text-[#2b3674]"}`}
          >
            Job Reports
          </button>
        </div>
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Username</th>
                <th className="px-4 py-3.5 text-center">Email</th>
                <th className="px-4 py-3.5 text-center">Contact</th>
                <th className="px-4 py-3.5 text-center">Report</th>
                <th className="rounded-tr-xl py-3.5 pl-4 pr-6 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-gray-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#2b3674]" />
                      Loading reports...
                    </span>
                  </td>
                </tr>
              ) : activeError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-red-600"
                  >
                    {activeError instanceof Error
                      ? activeError.message
                      : "Unable to load reports"}
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">
                      {item.username}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-700">
                      {item.email}
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-gray-700">
                      {item.contact}
                    </td>
                    <td className="max-w-[260px] px-4 py-4 text-center text-gray-600">
                      <p className="truncate">{item.report}</p>
                    </td>
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setSelectedReport({ id: item.id, type: activeTab })
                          }
                          aria-label={`View report from ${item.username}`}
                          className="cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] transition-colors hover:border-[#2b3674] hover:bg-[#eef2ff]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {item.email !== "N/A" && (
                          <a
                            href={`mailto:${item.email}`}
                            aria-label={`Email ${item.username}`}
                            className="cursor-pointer rounded-md bg-[#2b3674] p-1.5 text-white hover:bg-[#20285f]"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          disabled={
                            !item.suspendUserId || suspendMutation.isPending
                          }
                          onClick={() => setUserToSuspend(item)}
                          aria-label={`Suspend ${item.suspendUserName}`}
                          title={
                            item.suspendUserId
                              ? `Suspend ${item.suspendUserName}`
                              : "This post is not linked to a user account"
                          }
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-amber-200 px-2 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Suspend
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            setReportToDelete({ ...item, type: activeTab })
                          }
                          aria-label={`Delete report from ${item.username}`}
                          className="cursor-pointer rounded-md border border-red-200 p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          limit={limit}
          total={activeResponse?.meta.total ?? 0}
          currentCount={rows.length}
          onPageChange={setPage}
          disabled={isLoading}
        />
      </div>
      {selectedReport && (
        <ViewReport
          isOpen
          onClose={() => setSelectedReport(null)}
          reportId={selectedReport.id}
          reportType={selectedReport.type}
        />
      )}
      <DeleteModal
        isOpen={Boolean(reportToDelete)}
        onClose={() => !deleteMutation.isPending && setReportToDelete(null)}
        onConfirm={() =>
          reportToDelete && deleteMutation.mutate(reportToDelete)
        }
        itemName={`${reportToDelete?.username || "this user"}'s report`}
        isDeleting={deleteMutation.isPending}
      />
      <SuspendUserModal
        isOpen={Boolean(userToSuspend)}
        userName={userToSuspend?.suspendUserName || "this user"}
        isSuspending={suspendMutation.isPending}
        onClose={() => !suspendMutation.isPending && setUserToSuspend(null)}
        onConfirm={() => {
          if (userToSuspend?.suspendUserId) {
            suspendMutation.mutate(userToSuspend.suspendUserId);
          }
        }}
      />
    </>
  );
}

async function fetchReports<T>(
  endpoint: ReportType,
  page: number,
  limit: number,
  accessToken?: string,
): Promise<ListResponse<T>> {
  if (!accessToken) throw new Error("You are not authorized.");
  const params = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/${endpoint}?${params.toString()}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.success)
    throw new Error(data?.message || "Failed to fetch reports");
  return data;
}
