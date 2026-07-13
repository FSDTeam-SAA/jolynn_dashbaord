"use client";

import React, { useState } from "react";
import { Eye, Mail } from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import ViewReport from "./ViewReport";

export interface ReportItem {
  id: number;
  username: string;
  email: string;
  contact: string;
  report: string;
}

const fullReport = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const reports: ReportItem[] = [
  { id: 1, username: "Eduardo_12", email: "alma.lawson@example.com", contact: "(629) 555-0129", report: fullReport },
  { id: 2, username: "Dianne_22", email: "georgia.young@example.com", contact: "(207) 555-0119", report: fullReport },
  { id: 3, username: "Kyle_87", email: "nevaeh.simmons@example.com", contact: "(270) 555-0117", report: fullReport },
  { id: 4, username: "Cameron_32", email: "deanna.curtis@example.com", contact: "(303) 555-0105", report: fullReport },
  { id: 5, username: "Brooklyn_18", email: "brooklyn.simmons@example.com", contact: "(406) 555-0120", report: fullReport },
  { id: 6, username: "Leslie_44", email: "leslie.alexander@example.com", contact: "(319) 555-0148", report: fullReport },
  { id: 7, username: "Jenny_09", email: "jenny.wilson@example.com", contact: "(480) 555-0136", report: fullReport },
  { id: 8, username: "Robert_51", email: "robert.fox@example.com", contact: "(505) 555-0174", report: fullReport },
  { id: 9, username: "Wade_73", email: "wade.warren@example.com", contact: "(615) 555-0193", report: fullReport },
  { id: 10, username: "Esther_26", email: "esther.howard@example.com", contact: "(702) 555-0151", report: fullReport },
  { id: 11, username: "Jacob_65", email: "jacob.jones@example.com", contact: "(808) 555-0165", report: fullReport },
  { id: 12, username: "Jane_38", email: "jane.cooper@example.com", contact: "(917) 555-0182", report: fullReport },
];

export default function ReportManagementList() {
  const [page, setPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const limit = 5;
  const paginatedReports = reports.slice((page - 1) * limit, page * limit);
  const selectedReport = reports.find((report) => report.id === selectedReportId);

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Username</th>
                <th className="px-4 py-3.5 text-center">Email</th>
                <th className="px-4 py-3.5 text-center">Contact</th>
                <th className="px-4 py-3.5 text-center">Report</th>
                <th className="rounded-tr-xl py-3.5 pl-4 pr-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {paginatedReports.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">{item.username}</td>
                  <td className="px-4 py-4 text-center text-gray-700">{item.email}</td>
                  <td className="px-4 py-4 text-center font-medium text-gray-700">{item.contact}</td>
                  <td className="max-w-[260px] px-4 py-4 text-center text-gray-600"><p className="truncate">{item.report}</p></td>
                  <td className="py-4 pl-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => setSelectedReportId(item.id)} aria-label={`View report from ${item.username}`} className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] transition-colors hover:border-[#2b3674] hover:bg-[#eef2ff]"><Eye className="h-4 w-4" /></button>
                      <a href={`mailto:${item.email}`} aria-label={`Email ${item.username}`} className="rounded-md bg-[#2b3674] p-1.5 text-white transition-colors hover:bg-[#20285f]"><Mail className="h-4 w-4" /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={limit} total={reports.length} currentCount={paginatedReports.length} onPageChange={setPage} />
      </div>

      {selectedReport && <ViewReport isOpen={selectedReportId !== null} onClose={() => setSelectedReportId(null)} reportId={selectedReport.id} report={selectedReport} />}
    </>
  );
}
