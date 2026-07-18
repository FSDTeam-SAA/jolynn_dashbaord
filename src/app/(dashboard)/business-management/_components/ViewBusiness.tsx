"use client";

import React from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface ViewBusinessProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

type BusinessDetailsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    username?: string;
    role: string;
    gender?: string;
    phoneNumber?: string;
    status: string;
    tag?: string;
    profilePicture?: string;
    address?: string;
    country?: string;
    postcode?: string;
    state?: string;
    createdAt: string;
  };
};

export default function ViewBusiness({
  isOpen,
  onClose,
  businessId,
}: ViewBusinessProps) {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;

  const { data: businessResponse, isPending } =
    useQuery<BusinessDetailsResponse>({
      queryKey: ["businessUser", businessId, accessToken],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${businessId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to fetch business details");
        }

        return data;
      },
      enabled: isOpen && Boolean(businessId) && Boolean(accessToken),
    });

  const businessData = businessResponse?.data;
  const ownerName = businessData
    ? [businessData.firstName, businessData.lastName].filter(Boolean).join(" ")
    : "";
  const formattedStatus = businessData?.status
    ? businessData.status.charAt(0).toUpperCase() + businessData.status.slice(1)
    : "";

  // Status Badge color helper
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "active":
        return "border-[#22c55e] text-[#22c55e] bg-[#f0fdf4]";
      case "pending":
        return "border-[#f59e0b] text-[#f59e0b] bg-[#fffbeb]";
      case "rejected":
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
            {businessData?.username || ownerName || "Business Details"}
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
        {isPending && (
          <div className="py-8 text-center text-sm font-medium text-gray-500">
            Loading business details...
          </div>
        )}

        {businessData && (
        <div className="flex flex-col gap-6">
          {/* Owner Info Block */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">Owner</span>
            <span className="text-sm font-medium text-gray-400">
              {ownerName || businessData.email}
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
                  className={`inline-block min-w-[85px] px-3 py-1 text-xs font-semibold rounded-full border text-center ${getStatusStyles(businessData.status.toLowerCase())}`}
                >
                  {formattedStatus}
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
                  {businessData.tag || businessData.role}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">Email</span>
              <span className="break-all text-sm font-medium text-gray-400">
                {businessData.email}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">Phone</span>
              <span className="text-sm font-medium text-gray-400">
                {businessData.phoneNumber || "N/A"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">Role</span>
              <span className="text-sm font-medium text-gray-400">
                {businessData.role}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">
                Gender
              </span>
              <span className="text-sm font-medium capitalize text-gray-400">
                {businessData.gender || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">Address</span>
            <span className="text-sm font-medium text-gray-400">
              {[
                businessData.address,
                businessData.state,
                businessData.postcode,
                businessData.country,
              ]
                .filter(Boolean)
                .join(", ") || "N/A"}
            </span>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
