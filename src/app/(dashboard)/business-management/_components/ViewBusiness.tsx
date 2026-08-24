"use client";

import React from "react";
import {
  X,
  User,
  Globe,
  MapPin,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  Tag,
  Briefcase,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
    businessName?: string;
    businessEmail?: string;
    businessWebsiteUrl?: string;
    serviceArea?: string;
    category?: string;
    requestedCategory?: string | null;
    role: string;
    gender?: string;
    phoneNumber?: string;
    status: string;
    tag?: string;
    bio?: string;
    profilePicture?: string;
    address?: string;
    city?: string;
    country?: string;
    postcode?: string;
    state?: string;
    dateOfBirth?: string;
    agreementAccepted?: boolean;
    emailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
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

  const getStatusStyles = (status?: string) => {
    switch (status?.toLowerCase()) {
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

  const addressFormatted = businessData
    ? [
        businessData.address,
        businessData.city,
        businessData.state,
        businessData.postcode,
        businessData.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-[620px] w-[92%] max-h-[88vh] overflow-y-auto bg-white rounded-2xl p-6 border-0 shadow-2xl gap-0 focus:outline-none scrollbar-thin"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        showCloseButton={false}
        data-business-id={businessId}
      >
        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-[#2b3674] tracking-tight">
            Business Details
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </DialogHeader>

        {/* Loading State */}
        {isPending && (
          <div className="py-12 text-center text-sm font-medium text-gray-500">
            Loading business details...
          </div>
        )}

        {/* Content */}
        {businessData && (
          <div className="flex flex-col gap-6 pt-5">
            {/* Top Profile Banner Box */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              {/* Profile Image / Avatar */}
              <div className="relative h-16 w-16 min-w-[64px] rounded-full overflow-hidden border-2 border-white shadow-sm bg-indigo-50 flex items-center justify-center text-[#3b4cb8]">
                {businessData.profilePicture ? (
                  <Image
                    src={businessData.profilePicture}
                    alt={businessData.businessName || ownerName || "User"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <Building className="w-8 h-8 stroke-[1.5]" />
                )}
              </div>

              {/* Title & Badges */}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-800 truncate">
                    {businessData.businessName || ownerName || "N/A"}
                  </h3>
                  <span
                    className={`inline-block px-3 py-0.5 text-xs font-semibold rounded-full border text-center ${getStatusStyles(businessData.status)}`}
                  >
                    {formattedStatus}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                  {ownerName && (
                    <span className="flex items-center gap-1 font-medium text-gray-600">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {ownerName}
                    </span>
                  )}
                  {businessData.username && (
                    <span className="text-gray-400">@{businessData.username}</span>
                  )}
                  {businessData.tag && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-[#3b4cb8] font-medium text-[11px]">
                      <Tag className="w-3 h-3" />
                      {businessData.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                Business Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <DetailItem
                  label="Business Name"
                  value={businessData.businessName || "N/A"}
                />
                <DetailItem
                  label="Business Email"
                  value={businessData.businessEmail || businessData.email}
                  isMail
                />
                <DetailItem
                  label="Category"
                  value={businessData.category || "N/A"}
                />
                {businessData.requestedCategory && (
                  <DetailItem
                    label="Requested Category"
                    value={businessData.requestedCategory}
                  />
                )}
                <DetailItem
                  label="Service Area"
                  value={businessData.serviceArea || "N/A"}
                />
                <DetailItem
                  label="Website URL"
                  value={businessData.businessWebsiteUrl || "N/A"}
                  isLink
                />
              </div>
            </div>

            {/* Owner Personal Information Section */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Owner Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <DetailItem
                  label="Owner Name"
                  value={ownerName || "N/A"}
                />
                <DetailItem
                  label="Username"
                  value={businessData.username ? `@${businessData.username}` : "N/A"}
                />
                <DetailItem
                  label="Account Email"
                  value={businessData.email}
                  isMail
                />
                <DetailItem
                  label="Phone Number"
                  value={businessData.phoneNumber || "N/A"}
                  isPhone
                />
                <DetailItem
                  label="Role"
                  value={businessData.role}
                  className="capitalize"
                />
                <DetailItem
                  label="Gender"
                  value={businessData.gender || "N/A"}
                  className="capitalize"
                />
                {businessData.dateOfBirth && (
                  <DetailItem
                    label="Date of Birth"
                    value={new Date(businessData.dateOfBirth).toLocaleDateString()}
                  />
                )}
              </div>
            </div>

            {/* Bio Section (if available) */}
            {businessData.bio && (
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Bio / Description
                </h4>
                <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 text-sm text-gray-600 leading-relaxed">
                  {businessData.bio}
                </div>
              </div>
            )}

            {/* Location & Address Section */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Location & Address
              </h4>
              <div className="p-4 rounded-xl bg-gray-50/50 border border-gray-100 text-sm font-medium text-gray-700">
                {addressFormatted || "N/A"}
              </div>
            </div>

            {/* Account Metadata & Verification Status */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Account Status & Verification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-500">Email Verified</span>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {businessData.emailVerified ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1 font-semibold text-xs">
                        <XCircle className="w-4 h-4 text-amber-500" />
                        Unverified
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-gray-500">Agreement Accepted</span>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {businessData.agreementAccepted ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-semibold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Accepted
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1 font-semibold text-xs">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        Not Accepted
                      </span>
                    )}
                  </div>
                </div>

                {businessData.createdAt && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500">Joined Date</span>
                    <span className="text-xs font-medium text-gray-700 flex items-center gap-1 pt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(businessData.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  label,
  value,
  isMail,
  isPhone,
  isLink,
  className = "",
}: {
  label: string;
  value: string;
  isMail?: boolean;
  isPhone?: boolean;
  isLink?: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold text-gray-500">{label}</span>
      {isMail && value !== "N/A" ? (
        <a
          href={`mailto:${value}`}
          className="text-xs font-medium text-[#3b4cb8] hover:underline break-all"
        >
          {value}
        </a>
      ) : isPhone && value !== "N/A" ? (
        <a
          href={`tel:${value}`}
          className="text-xs font-medium text-[#3b4cb8] hover:underline break-all"
        >
          {value}
        </a>
      ) : isLink && value !== "N/A" ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[#3b4cb8] hover:underline break-all flex items-center gap-1"
        >
          <Globe className="w-3 h-3 inline" />
          {value}
        </a>
      ) : (
        <span className={`text-xs font-medium text-gray-700 break-words ${className}`}>
          {value}
        </span>
      )}
    </div>
  );
}
