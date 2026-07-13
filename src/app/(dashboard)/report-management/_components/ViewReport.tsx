"use client";

import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReportItem } from "./ReportManagementList";

interface ViewReportProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: number;
  report: ReportItem;
}

export default function ViewReport({
  isOpen,
  onClose,
  reportId,
  report,
}: ViewReportProps) {
  // Use reportId here when connecting the single-report API query.
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[85vh] w-[92%] max-w-[650px] overflow-y-auto gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        showCloseButton={false}
        data-report-id={reportId}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Report Details
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report details"
            className="rounded-md p-1 text-gray-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
          <Detail label="Username" value={report.username} />
          <Detail label="Contact" value={report.contact} />
          <Detail label="Email" value={report.email} />
          <div className="space-y-1.5 sm:col-span-3">
            <h3 className="text-sm font-semibold text-gray-700">Report</h3>
            <p className="text-sm leading-6 text-gray-500">{report.report}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span className="break-all text-sm font-medium text-gray-400">
        {value}
      </span>
    </div>
  );
}
