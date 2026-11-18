"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Globe,
  MapPin,
  Building,
  Calendar,
  CheckCircle2,
  Tag,
  Briefcase,
  FileText,
  Star,
  ImageIcon,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  Quote,
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

interface ViewReferralBusinessProps {
  isOpen: boolean;
  onClose: () => void;
  referralId: string;
}

type ReferralDetailsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    id: string;
    listingId: string;
    slug: string;
    profileUrl?: string;
    businessName: string;
    businessEmail?: string;
    businessPhone?: string;
    image?: string;
    images?: string[];
    category?: string;
    state?: string;
    city?: string;
    rating?: number;
    review?: string;
    source?: "customer" | "admin";
    listingStatus?: string;
    claimStatus?: "claimed" | "unclaimed";
    isVerified?: boolean;
    isClaimable?: boolean;
    claimedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    emailDeliveryStatus?: "pending" | "sent" | "failed";
    emailDeliveryAttempts?: number;
    emailLastAttemptAt?: string;
    referredBy?: {
      id?: string;
      name?: string;
      avatar?: string;
    };
    referredByUser?: {
      id?: string;
      name?: string;
      email?: string;
      username?: string;
      avatar?: string;
      role?: string;
    };
    claimedByUser?: {
      id?: string;
      name?: string;
      email?: string;
      username?: string;
      avatar?: string;
      businessName?: string;
    };
  };
};

export default function ViewReferralBusiness({
  isOpen,
  onClose,
  referralId,
}: ViewReferralBusinessProps) {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;

  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data: referralResponse, isPending } =
    useQuery<ReferralDetailsResponse>({
      queryKey: ["referralBusiness", referralId, accessToken],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/business-referrals/admin/${referralId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Failed to fetch referral business details"
          );
        }

        return data;
      },
      enabled: isOpen && Boolean(referralId) && Boolean(accessToken),
    });

  const referral = referralResponse?.data;
  const claimStatus = referral?.claimStatus || "unclaimed";
  const isClaimed = claimStatus === "claimed";

  const allImages = Array.from(
    new Set(
      [
        ...(Array.isArray(referral?.images) ? referral.images : []),
        referral?.image,
      ].filter(
        (img): img is string => typeof img === "string" && img.trim().length > 0
      )
    )
  );

  const displayMainImage =
    activeImage && allImages.includes(activeImage)
      ? activeImage
      : allImages[0] ?? null;

  const locationFormatted = [referral?.city, referral?.state]
    .filter(Boolean)
    .join(", ");

  const referrerDisplayName =
    referral?.referredByUser?.name ||
    referral?.referredBy?.name ||
    "Community member";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[96vw] max-w-[1140px] sm:max-w-[96vw] md:max-w-[94vw] lg:max-w-[1100px] xl:max-w-[1180px] max-h-[90vh] overflow-y-auto bg-[#f8fafc] rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/80 shadow-2xl gap-0 focus:outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        overlayClassName="bg-slate-950/45 backdrop-blur-[4px]"
        showCloseButton={false}
        data-referral-id={referralId}
      >
        {/* Top Right Corner Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="absolute right-4 top-4 sm:right-6 sm:top-6 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors focus:outline-none cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-200/70 pr-12">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2b3674]/10 text-[#2b3674]">
              <Building className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-xl font-bold text-[#1b2559] tracking-tight">
                Referral Business Details
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Full referral breakdown, customer review, and ownership status
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Loading State */}
        {isPending && (
          <div className="py-16 text-center text-sm font-medium text-slate-500">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#2b3674] border-t-transparent mb-2" />
            <p>Loading referral business details...</p>
          </div>
        )}

        {/* Content */}
        {referral && (
          <div className="flex flex-col gap-5 pt-5">
            {/* Top Hero Banner Box */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 min-w-[64px] sm:min-w-[80px] rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-gradient-to-br from-[#2b3674] to-[#4318ff] flex items-center justify-center text-white shrink-0">
                  {displayMainImage ? (
                    <Image
                      src={displayMainImage}
                      alt={referral.businessName || "Referral Business"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Building className="w-9 h-9 stroke-[1.5]" />
                  )}
                </div>

                <div className="flex flex-col gap-1.5 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#1b2559] truncate leading-tight">
                    {referral.businessName || "N/A"}
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f4f7fe] px-2.5 py-0.5 text-xs font-semibold text-[#4318ff]">
                      <Tag className="w-3 h-3" />
                      {referral.category || "General"}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
                      {referral.source ? `${referral.source} Referral` : "Referral"}
                    </span>
                    {typeof referral.rating === "number" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {referral.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Claim Status Pill */}
              <div className="shrink-0 self-start sm:self-center">
                {isClaimed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-[#f0fdf4] px-3.5 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Verified Claimed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-[#fffbeb] px-3.5 py-1.5 text-xs font-bold text-amber-700 shadow-2xs">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Unclaimed Listing
                  </span>
                )}
              </div>
            </div>

            {/* Main 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Referrer Review & Business Info (7 cols) */}
              <div className="md:col-span-7 flex flex-col gap-5">
                {/* Referrer & Review Card */}
                <div className="rounded-2xl bg-white p-5 border border-slate-200/70 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#2b3674]" />
                      Referrer & Community Review
                    </h4>
                    {typeof referral.rating === "number" && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.round(referral.rating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-800 ml-1">
                          {referral.rating.toFixed(1)} / 5
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-[#3b4cb8] font-bold text-sm uppercase overflow-hidden shrink-0 border border-indigo-200">
                      {referral.referredByUser?.avatar ||
                      referral.referredBy?.avatar ? (
                        <Image
                          src={
                            referral.referredByUser?.avatar ||
                            referral.referredBy?.avatar ||
                            ""
                          }
                          alt={referrerDisplayName}
                          width={40}
                          height={40}
                          className="object-cover h-full w-full"
                          unoptimized
                        />
                      ) : (
                        <User className="w-5 h-5 text-[#2b3674]" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {referrerDisplayName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {referral.referredByUser?.email || "Community Referrer"}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3b4cb8] font-semibold text-[11px]">
                      Referrer
                    </span>
                  </div>

                  {referral.review ? (
                    <div className="relative rounded-xl bg-[#f8faff] border border-indigo-100/70 p-4">
                      <Quote className="absolute right-3 top-3 h-5 w-5 text-indigo-200 rotate-180" />
                      <p className="text-sm text-slate-700 italic leading-relaxed pr-6">
                        “{referral.review}”
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No review text provided with this referral.
                    </p>
                  )}
                </div>

                {/* Business Information Card */}
                <div className="rounded-2xl bg-white p-5 border border-slate-200/70 shadow-xs flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#2b3674]" />
                    Business & Contact Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailBox
                      icon={<Building className="w-3.5 h-3.5 text-slate-400" />}
                      label="Business Name"
                      value={referral.businessName || "N/A"}
                    />
                    <DetailBox
                      icon={<Tag className="w-3.5 h-3.5 text-slate-400" />}
                      label="Category"
                      value={referral.category || "N/A"}
                    />
                    <DetailBox
                      icon={<Mail className="w-3.5 h-3.5 text-slate-400" />}
                      label="Business Email"
                      value={referral.businessEmail || "N/A"}
                      isMail
                    />
                    <DetailBox
                      icon={<Phone className="w-3.5 h-3.5 text-slate-400" />}
                      label="Business Phone"
                      value={referral.businessPhone || "N/A"}
                      isPhone
                    />
                    <DetailBox
                      icon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
                      label="Location & Region"
                      value={locationFormatted || "N/A"}
                    />
                    <DetailBox
                      icon={<Briefcase className="w-3.5 h-3.5 text-slate-400" />}
                      label="Listing Status"
                      value={
                        referral.listingStatus
                          ? referral.listingStatus.toUpperCase()
                          : "PUBLISHED"
                      }
                      className="font-bold text-slate-800"
                    />
                    {referral.slug && (
                      <DetailBox
                        icon={<Globe className="w-3.5 h-3.5 text-slate-400" />}
                        label="Public Slug"
                        value={referral.slug}
                      />
                    )}
                    {referral.profileUrl && (
                      <DetailBox
                        icon={<ExternalLink className="w-3.5 h-3.5 text-slate-400" />}
                        label="Directory Link"
                        value={referral.profileUrl}
                        isLink
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Media Gallery, Metadata (5 cols) */}
              <div className="md:col-span-5 flex flex-col gap-5">
                {/* Media & Images Card */}
                <div className="rounded-2xl bg-white p-5 border border-slate-200/70 shadow-xs flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#2b3674]" />
                      Business Photos
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {allImages.length} {allImages.length === 1 ? "Image" : "Images"}
                    </span>
                  </div>

                  {allImages.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {/* Main Preview Box */}
                      <div className="relative h-56 sm:h-64 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner">
                        {displayMainImage ? (
                          <Image
                            src={displayMainImage}
                            alt="Selected Referral Photo"
                            fill
                            className="object-cover transition-all duration-200"
                            unoptimized
                          />
                        ) : null}
                      </div>

                      {/* Thumbnails Row */}
                      {allImages.length > 1 && (
                        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {allImages.map((img, idx) => {
                            const isSelected = img === displayMainImage;
                            return (
                              <button
                                key={`${img}-${idx}`}
                                type="button"
                                onClick={() => setActiveImage(img)}
                                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-[#2b3674] ring-2 ring-[#2b3674]/25 shadow-xs scale-102"
                                    : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400"
                                }`}
                                aria-label={`Preview photo ${idx + 1}`}
                              >
                                <Image
                                  src={img}
                                  alt={`Thumbnail ${idx + 1}`}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                      <ImageIcon className="h-8 w-8 text-slate-300 mb-1" />
                      <p className="text-xs font-semibold text-slate-600">No photos uploaded</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        This business was referred without attached images.
                      </p>
                    </div>
                  )}
                </div>

                {/* Metadata Tile Card */}
                <div className="rounded-2xl bg-white p-5 border border-slate-200/70 shadow-xs flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2b3674]" />
                    Record Timeline
                  </h4>
                  <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Referred On</span>
                      <span className="font-semibold text-slate-800">
                        {referral.createdAt
                          ? new Date(referral.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                    </div>
                    {referral.emailDeliveryStatus && (
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Claim Email Status</span>
                        <span className="font-semibold capitalize text-slate-800 flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              referral.emailDeliveryStatus === "sent"
                                ? "bg-emerald-500"
                                : referral.emailDeliveryStatus === "failed"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {referral.emailDeliveryStatus}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500 font-medium">Referral ID</span>
                      <span className="font-mono text-[11px] text-slate-500 truncate max-w-[170px]">
                        {referral.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailBox({
  label,
  value,
  icon,
  isMail,
  isPhone,
  isLink,
  className = "",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  isMail?: boolean;
  isPhone?: boolean;
  isLink?: boolean;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
        {icon}
        {label}
      </span>
      {isMail && value !== "N/A" ? (
        <a
          href={`mailto:${value}`}
          className="text-xs font-semibold text-[#2b3674] hover:underline break-all"
        >
          {value}
        </a>
      ) : isPhone && value !== "N/A" ? (
        <a
          href={`tel:${value}`}
          className="text-xs font-semibold text-[#2b3674] hover:underline break-all"
        >
          {value}
        </a>
      ) : isLink && value !== "N/A" ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#2b3674] hover:underline break-all flex items-center gap-1"
        >
          <Globe className="w-3 h-3 inline shrink-0" />
          <span className="truncate">{value}</span>
        </a>
      ) : (
        <span className={`text-xs font-semibold text-slate-800 break-words ${className}`}>
          {value}
        </span>
      )}
    </div>
  );
}
