"use client";

import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ViewUserProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userData: {
    username: string;
    email: string;
    contact: string;
    status: string;
  };
}

export default function ViewUser({
  isOpen,
  onClose,
  userId,
  userData,
}: ViewUserProps) {
  // Use userId here when connecting the single-user API query.
  const statusStyles =
    userData.status === "Active"
      ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]"
      : "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[90%] max-w-[560px] gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl focus:outline-none"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        showCloseButton={false}
        data-user-id={userId}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-gray-800">
            User Details
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close user details"
            className="rounded-md p-1 text-gray-700 transition-colors hover:bg-slate-100 focus:outline-none"
          >
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Username</span>
            <span className="text-sm font-medium text-gray-400">{userData.username}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Email</span>
            <span className="break-all text-sm font-medium text-gray-400">{userData.email}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">Contact</span>
            <span className="text-sm font-medium text-gray-400">{userData.contact}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-700">Status</span>
            <div>
              <span className={`inline-block min-w-[85px] rounded-full border px-3 py-1 text-center text-xs font-semibold ${statusStyles}`}>
                {userData.status}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
