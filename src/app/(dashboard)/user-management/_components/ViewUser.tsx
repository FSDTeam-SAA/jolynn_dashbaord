"use client";

import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type UserDetails = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  role: string;
  gender?: string;
  phoneNumber?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  status: string;
  tag?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  agreementAccepted?: boolean;
  businessName?: string;
  businessEmail?: string;
  businessWebsiteUrl?: string;
  serviceArea?: string;
  category?: string;
  serviceCategoryId?: string;
  verifiedForget?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
};

interface ViewUserProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const formatBoolean = (value?: boolean) =>
  typeof value === "boolean" ? (value ? "Yes" : "No") : "N/A";

export default function ViewUser({ isOpen, onClose, userId }: ViewUserProps) {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const {
    data: response,
    isPending,
    error,
  } = useQuery<{
    success: boolean;
    message: string;
    data: UserDetails;
  }>({
    queryKey: ["managedUser", userId, accessToken],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${userId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = await res.json();
      if (!res.ok || !data?.success)
        throw new Error(data?.message || "Failed to fetch user details");
      return data;
    },
    enabled: isOpen && Boolean(accessToken),
  });

  const user = response?.data;
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email ||
    "User";
  const isBusinessOwner = user?.role === "businessOwner";
  const statusStyles =
    user?.status === "active"
      ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]"
      : user?.status === "pending"
        ? "border-[#f59e0b] bg-[#fffbeb] text-[#f59e0b]"
        : "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[90vh] w-[92%] max-w-[850px] flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        showCloseButton={false}
        data-user-id={userId}
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b border-gray-100 px-6 py-5">
          <DialogTitle className="text-xl font-bold text-gray-800">
            User Details
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1.5 text-gray-700 hover:bg-slate-100"
            aria-label="Close user details"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {isPending && (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading user details...
            </div>
          )}
          {error && (
            <div className="py-12 text-center text-sm text-red-600">
              {error instanceof Error
                ? error.message
                : "Unable to load user details"}
            </div>
          )}
          {user && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-xl bg-[#f8f9ff] p-2">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-[#e8ecff] text-xl font-bold text-[#2b3674] shadow-sm">
                  {user.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={displayName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-[#2b3674]">
                    {displayName}
                  </h3>
                  <p className="truncate text-sm text-gray-500">{user.email}</p>
                  {isBusinessOwner && (user.businessName || user.category) && (
                    <p className="mt-1 truncate text-sm font-medium text-gray-600">
                      {[user.businessName, user.category].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  <span
                    className={`mt-2 inline-block min-w-[80px] rounded-full border px-3 py-1 text-center text-xs font-semibold capitalize ${statusStyles}`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>

              <Section title="Personal Information">
                <Detail label="First Name" value={user.firstName} />
                <Detail label="Last Name" value={user.lastName} />
                <Detail label="Username" value={user.username} />
                <Detail
                  label="Role"
                  value={
                    isBusinessOwner ? "Business Owner" : user.role
                  }
                  capitalize
                />
                <Detail label="Gender" value={user.gender} capitalize />
                <Detail label="Tag" value={user.tag} />
                <Detail
                  label="Agreement Accepted"
                  value={formatBoolean(user.agreementAccepted)}
                />
              </Section>

              <Section title="Contact & Address">
                <Detail label="Email" value={user.email} />
                <Detail label="City" value={user.city} />
                <Detail label="State" value={user.state} />
              </Section>

              {isBusinessOwner && (
                <Section title="Business Information">
                  <Detail label="Business Name" value={user.businessName} />
                  <Detail label="Business Email" value={user.businessEmail} />
                  <Detail
                    label="Website"
                    value={user.businessWebsiteUrl}
                    isLink
                  />
                  <Detail label="Category" value={user.category} />
                </Section>
              )}

              {user.bio && (
                <Section title="About">
                  <div className="sm:col-span-2">
                    <Detail label="Bio" value={user.bio} />
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="mb-4 border-b border-gray-100 pb-2 text-sm font-bold uppercase tracking-wide text-[#2b3674]">
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
  capitalize = false,
  isLink = false,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
  isLink?: boolean;
}) {
  const displayedValue = value?.trim() || "N/A";
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {isLink && displayedValue !== "N/A" ? (
        <a
          href={displayedValue}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm font-medium text-[#3b4cb8] hover:underline"
        >
          {displayedValue}
        </a>
      ) : (
        <span
          className={`break-words text-sm font-medium text-gray-800 ${capitalize ? "capitalize" : ""}`}
        >
          {displayedValue}
        </span>
      )}
    </div>
  );
}
