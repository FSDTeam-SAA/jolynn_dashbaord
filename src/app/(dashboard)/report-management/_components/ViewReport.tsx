"use client";

import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { ReportType } from "./ReportManagementList";

type ReportDetails = {
  _id: string;
  userId?: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string } | string;
  ownerId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email?: string;
    phoneNumber?: string;
  };
  services?: Array<{ _id?: string; title?: string; description?: string }>;
  helpWantedId?: { username?: string; email?: string; phone?: string; zipcode?: string; category?: string; message?: string; userId?: string };
  message: string;
  createdAt: string;
};

interface ViewReportProps { isOpen: boolean; onClose: () => void; reportId: string; reportType: ReportType }

export default function ViewReport({ isOpen, onClose, reportId, reportType }: ViewReportProps) {
  const { data: session } = useSession();
  const sessionUser = session?.user as { accessToken?: string; token?: string } | undefined;
  const accessToken = sessionUser?.accessToken ?? sessionUser?.token;
  const { data: response, isPending, error } = useQuery<{ success: boolean; message: string; data: ReportDetails }>({
    queryKey: ["reportDetails", reportType, reportId, accessToken],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/${reportType}/${reportId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch report details");
      return data;
    },
    enabled: isOpen && Boolean(accessToken),
  });
  const report = response?.data;
  const isJobReport = reportType === "job-report";
  const user = report && typeof report.userId === "object" ? report.userId : undefined;
  const username = isJobReport ? report?.helpWantedId?.username : [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const email = isJobReport ? report?.helpWantedId?.email : user?.email;
  const contact = isJobReport ? report?.helpWantedId?.phone : user?.phoneNumber;
  const businessOwner = report?.ownerId;
  const businessName =
    businessOwner?.businessName ||
    [businessOwner?.firstName, businessOwner?.lastName].filter(Boolean).join(" ");
  const services = report?.services?.map((service) => service.title).filter(Boolean).join(", ");

  return <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-h-[85vh] w-[92%] max-w-[650px] overflow-y-auto gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl" overlayClassName="bg-slate-950/35 backdrop-blur-[3px]" showCloseButton={false} data-report-id={reportId}>
      <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6"><DialogTitle className="text-xl font-bold text-gray-800">{isJobReport ? "Job Report Details" : "Business Report Details"}</DialogTitle><button type="button" onClick={onClose} aria-label="Close report details" className="rounded-md p-1 text-gray-700 hover:bg-slate-100"><X className="h-4 w-4" /></button></DialogHeader>
      {isPending && <div className="py-8 text-center text-sm text-gray-500">Loading report details...</div>}
      {error && <div className="py-8 text-center text-sm text-red-600">{error instanceof Error ? error.message : "Unable to load report details"}</div>}
      {report && <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
        <Detail label="Username" value={username || "N/A"} /><Detail label="Contact" value={contact || "N/A"} /><Detail label="Email" value={email || "N/A"} />
        {isJobReport ? <><Detail label="Category" value={report.helpWantedId?.category || "N/A"} /><Detail label="Zipcode" value={report.helpWantedId?.zipcode || "N/A"} /></> : <><Detail label="Business Owner" value={businessName || "N/A"} /><Detail label="Business Email" value={businessOwner?.email || "N/A"} /><Detail label="Services" value={services || "N/A"} /></>}
        {isJobReport && <div className="space-y-1.5 sm:col-span-3"><h3 className="text-sm font-semibold text-gray-700">Job Message</h3><p className="text-sm leading-6 text-gray-500">{report.helpWantedId?.message || "N/A"}</p></div>}
        <div className="space-y-1.5 sm:col-span-3"><h3 className="text-sm font-semibold text-gray-700">Report</h3><p className="text-sm leading-6 text-gray-500">{report.message}</p></div>
      </div>}
    </DialogContent>
  </Dialog>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-1.5"><span className="text-sm font-semibold text-gray-700">{label}</span><span className="break-all text-sm font-medium text-gray-400">{value}</span></div>;
}
