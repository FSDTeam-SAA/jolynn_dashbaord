"use client";

import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewBusinessProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
  businessData?: {
    name: string;
    owner: string;
    status: "Active" | "Pending" | "Rejected" | string;
    category: string;
  };
}

export default function ViewBusiness({
  isOpen,
  onClose,
  businessId,
  businessData = {
    name: "Anderson Electric Co.",
    owner: "James Anderson",
    status: "Active",
    category: "Electricians",
  },
}: ViewBusinessProps) {
  // Use businessId here when connecting the single-business API query.

  // Status Badge color helper
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Active":
        return "border-[#22c55e] text-[#22c55e] bg-[#f0fdf4]";
      case "Pending":
        return "border-[#f59e0b] text-[#f59e0b] bg-[#fffbeb]";
      case "Rejected":
        return "border-[#ef4444] text-[#ef4444] bg-[#fef2f2]";
      default:
        return "border-gray-200 text-gray-500 bg-gray-50";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[500px] w-[90%] bg-white rounded-2xl p-6 border-0 shadow-2xl gap-0 focus:outline-none"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        // shadcn এর ডিফল্ট ক্লোজ বাটন হাইড করার জন্য custom close handler ব্যবহার করা হয়েছে
        showCloseButton={false}
        data-business-id={businessId}
      >
        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-5">
          <DialogTitle className="text-xl font-bold text-gray-800 tracking-tight">
            {businessData.name}
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close business details"
            className="p-1 rounded-md text-gray-700 hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </DialogHeader>

        {/* Modal Body / Information Grid */}
        <div className="flex flex-col gap-6">
          {/* Owner Info Block */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">Owner</span>
            <span className="text-sm font-medium text-gray-400">
              {businessData.owner}
            </span>
          </div>

          {/* Status & Category Columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status Section */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">
                Status
              </span>
              <div>
                <span
                  className={`inline-block min-w-[85px] px-3 py-1 text-xs font-semibold rounded-full border text-center ${getStatusStyles(businessData.status)}`}
                >
                  {businessData.status}
                </span>
              </div>
            </div>

            {/* Category Section */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-700">
                Category
              </span>
              <div>
                <span className="inline-block px-3 py-1 text-xs font-medium bg-[#eef2ff] text-[#3b4cb8] rounded-md">
                  {businessData.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
