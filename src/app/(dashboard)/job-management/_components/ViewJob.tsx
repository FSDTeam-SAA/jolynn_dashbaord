"use client";

import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JobPost } from "./JobList";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface ViewJobProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
}

export default function ViewJob({ isOpen, onClose, jobId }: ViewJobProps) {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const { data: response, isPending } = useQuery<{ success: boolean; message: string; data: JobPost }>({
    queryKey: ["helpWantedJob", jobId, accessToken],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/help-wanted/${jobId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch job details");
      return data;
    },
    enabled: isOpen && Boolean(accessToken),
  });
  const job = response?.data;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[85vh] w-[92%] max-w-[650px] overflow-y-auto gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        showCloseButton={false}
        data-job-id={jobId}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Job Details
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close job details"
            className="rounded-md p-1 text-gray-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        {isPending && <div className="py-8 text-center text-sm text-gray-500">Loading job details...</div>}
        {job && <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <Detail label="Username" value={job.username} />
          <Detail label="Contact" value={job.phone} />
          <Detail label="Email" value={job.email} />
          <Detail label="Zip Code" value={job.zipcode} />
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-700">
              Category
            </span>
            <div>
              <span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#3b4cb8]">
                {job.category}
              </span>
            </div>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700">Requirement</h3>
            <p className="whitespace-pre-line text-sm leading-6 text-gray-500">
              {job.message}
            </p>
          </div>
        </div>}
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
