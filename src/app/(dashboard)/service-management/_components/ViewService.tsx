"use client";

import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ViewServiceProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: number;
  serviceData: {
    name: string;
    category: string;
    location: string;
    contact: string;
    hours: string;
    status: string;
  };
}

export default function ViewService({ isOpen, onClose, serviceId, serviceData }: ViewServiceProps) {
  // Use serviceId here when connecting the single-service API query.
  const statusStyles =
    serviceData.status === "Active"
      ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]"
      : "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[90%] max-w-[560px] gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl focus:outline-none"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        showCloseButton={false}
        data-service-id={serviceId}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-gray-800">Service Details</DialogTitle>
          <button type="button" onClick={onClose} aria-label="Close service details" className="rounded-md p-1 text-gray-700 transition-colors hover:bg-slate-100 focus:outline-none">
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <Detail label="Service Provider Name" value={serviceData.name} />
          <Detail label="Contact" value={serviceData.contact} />
          <Detail label="Location" value={serviceData.location} />
          <Detail label="Service Hours" value={serviceData.hours} />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Category</span>
            <div><span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#3b4cb8]">{serviceData.category}</span></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Status</span>
            <div><span className={`inline-block min-w-[85px] rounded-full border px-3 py-1 text-center text-xs font-semibold ${statusStyles}`}>{serviceData.status}</span></div>
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
      <span className="text-sm font-medium text-gray-400">{value}</span>
    </div>
  );
}
