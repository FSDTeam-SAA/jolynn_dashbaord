"use client";

import React, { useState } from "react";
import { Eye, Mail } from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import ViewReport from "./ViewReport";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export type ReportType = "report" | "job-report";

type ServiceReport = {
  _id: string;
  userId?: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string };
  serviceId?: { title?: string; description?: string };
  ownerId?: { email?: string };
  message: string;
  createdAt: string;
};

type JobReport = {
  _id: string;
  helpWantedId?: { username?: string; email?: string; phone?: string; category?: string; zipcode?: string; message?: string };
  userId: string;
  message: string;
  createdAt: string;
};

type ListResponse<T> = { success: boolean; message: string; meta: { page: number; limit: number; total: number }; data: T[] };

type TableRow = { id: string; username: string; email: string; contact: string; report: string };

export default function ReportManagementList() {
  const [activeTab, setActiveTab] = useState<ReportType>("report");
  const [reportPage, setReportPage] = useState(1);
  const [jobReportPage, setJobReportPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<{ id: string; type: ReportType } | null>(null);
  const limit = 10;
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  const reportsQuery = useQuery<ListResponse<ServiceReport>>({
    queryKey: ["reports", reportPage, accessToken],
    queryFn: () => fetchReports<ServiceReport>("report", reportPage, limit, accessToken),
    enabled: Boolean(accessToken) && activeTab === "report",
  });
  const jobReportsQuery = useQuery<ListResponse<JobReport>>({
    queryKey: ["jobReports", jobReportPage, accessToken],
    queryFn: () => fetchReports<JobReport>("job-report", jobReportPage, limit, accessToken),
    enabled: Boolean(accessToken) && activeTab === "job-report",
  });

  const isServiceReport = activeTab === "report";
  const activeResponse = isServiceReport ? reportsQuery.data : jobReportsQuery.data;
  const page = isServiceReport ? reportPage : jobReportPage;
  const setPage = isServiceReport ? setReportPage : setJobReportPage;
  const rows: TableRow[] = isServiceReport
    ? (reportsQuery.data?.data ?? []).map((item) => ({
        id: item._id,
        username: [item.userId?.firstName, item.userId?.lastName].filter(Boolean).join(" ") || "Unknown user",
        email: item.userId?.email || "N/A",
        contact: item.userId?.phoneNumber || "N/A",
        report: item.message,
      }))
    : (jobReportsQuery.data?.data ?? []).map((item) => ({
        id: item._id,
        username: item.helpWantedId?.username || "Unknown user",
        email: item.helpWantedId?.email || "N/A",
        contact: item.helpWantedId?.phone || "N/A",
        report: item.message,
      }));

  return <>
    <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
      <div className="grid w-full grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm sm:w-[390px]">
        <button type="button" onClick={() => setActiveTab("report")} className={`relative w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === "report" ? "bg-[linear-gradient(135deg,#2b3674_0%,#4365D0_100%)] text-white shadow-md shadow-[#2b3674]/20" : "text-gray-500 hover:bg-[#eef2ff] hover:text-[#2b3674]"}`}>Help Wanted Reports</button>
        <button type="button" onClick={() => setActiveTab("job-report")} className={`relative w-full cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === "job-report" ? "bg-[linear-gradient(135deg,#2b3674_0%,#4365D0_100%)] text-white shadow-md shadow-[#2b3674]/20" : "text-gray-500 hover:bg-[#eef2ff] hover:text-[#2b3674]"}`}>Job Reports</button>
      </div>
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[850px] border-collapse text-left"><thead><tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white"><th className="rounded-tl-xl py-3.5 pl-6 pr-4">Username</th><th className="px-4 py-3.5 text-center">Email</th><th className="px-4 py-3.5 text-center">Contact</th><th className="px-4 py-3.5 text-center">Report</th><th className="rounded-tr-xl py-3.5 pl-4 pr-6 text-center">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {rows.map((item) => <tr key={item.id} className="hover:bg-slate-50/50"><td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">{item.username}</td><td className="px-4 py-4 text-center text-gray-700">{item.email}</td><td className="px-4 py-4 text-center font-medium text-gray-700">{item.contact}</td><td className="max-w-[260px] px-4 py-4 text-center text-gray-600"><p className="truncate">{item.report}</p></td><td className="py-4 pl-4 pr-6"><div className="flex items-center justify-end gap-2"><button onClick={() => setSelectedReport({ id: item.id, type: activeTab })} aria-label={`View report from ${item.username}`} className="cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] transition-colors hover:border-[#2b3674] hover:bg-[#eef2ff]"><Eye className="h-4 w-4" /></button>{item.email !== "N/A" && <a href={`mailto:${item.email}`} aria-label={`Email ${item.username}`} className="cursor-pointer rounded-md bg-[#2b3674] p-1.5 text-white hover:bg-[#20285f]"><Mail className="h-4 w-4" /></a>}</div></td></tr>)}
            {!rows.length && <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-500">No reports found</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} limit={limit} total={activeResponse?.meta.total ?? 0} currentCount={rows.length} onPageChange={setPage} />
    </div>
    {selectedReport && <ViewReport isOpen onClose={() => setSelectedReport(null)} reportId={selectedReport.id} reportType={selectedReport.type} />}
  </>;
}

async function fetchReports<T>(endpoint: ReportType, page: number, limit: number, accessToken?: string): Promise<ListResponse<T>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/${endpoint}?limit=${limit}&page=${page}`, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch reports");
  return data;
}
