"use client";

import { formatDate } from "@/lib/format-date";

import React, { useDeferredValue, useEffect, useState } from "react";
import { Search, Eye, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/pagination/Pagination";
import ViewBusiness from "./ViewBusiness";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import RejectModal from "@/components/rejectModal/RejectModal";
import AddReferralBusinessDialog from "./AddReferralBusinessDialog";

type BusinessUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  businessName?: string;
  businessProfile?: {
    businessName?: string;
  };
  category?: string;
  role: string;
  status: string;
  tag?: string;
  createdAt?: string;
};

type BusinessListResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: BusinessUser[];
};

type ReferralBusiness = {
  id?: string;
  _id?: string;
  listingId?: string;
  businessName: string;
  category?: string;
  businessEmail?: string;
  email?: string;
  claimStatus?: "claimed" | "unclaimed";
  referredBy?: { name?: string };
  createdAt?: string;
};

type ReferralListResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: ReferralBusiness[];
};

export default function BusinessManagementList() {
  const [businessTab, setBusinessTab] = useState<"original" | "referred">("original");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null,
  );
  const [businessToReject, setBusinessToReject] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const limit = 10;
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;

  const { data: businessResponse } = useQuery<BusinessListResponse>({
    queryKey: [
      "businessUsers",
      statusFilter,
      deferredSearchQuery,
      page,
      accessToken,
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        role: "businessOwner",
        limit: limit.toString(),
        page: page.toString(),
      });

      if (statusFilter !== "all") queryParams.set("status", statusFilter);
      if (deferredSearchQuery) {
        queryParams.set("searchTerm", deferredSearchQuery);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch businesses");
      }

      return data;
    },
    enabled: Boolean(accessToken) && businessTab === "original",
  });

  const { data: referralResponse } = useQuery<ReferralListResponse>({
    queryKey: ["referredBusinesses", deferredSearchQuery, page, accessToken],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (deferredSearchQuery) queryParams.set("searchTerm", deferredSearchQuery);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/business-referrals?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch referred businesses");
      }
      return data;
    },
    enabled: Boolean(accessToken) && businessTab === "referred",
  });

  const businesses = businessResponse?.data ?? [];
  const totalBusinesses = businessResponse?.meta.total ?? 0;
  const referredBusinesses = referralResponse?.data ?? [];
  const totalReferredBusinesses = referralResponse?.meta.total ?? 0;

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        const errorMessage = Array.isArray(data?.message)
          ? data.message[0]
          : data?.message;
        throw new Error(errorMessage || "Failed to update status");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["businessUsers"] });
      queryClient.invalidateQueries({ queryKey: ["businessUser"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ status: "rejected", reason }),
        }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        const errorMessage = Array.isArray(data?.message)
          ? data.message[0]
          : data?.message;
        throw new Error(errorMessage || "Failed to reject business");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Business rejected successfully");
      setBusinessToReject(null);
      queryClient.invalidateQueries({ queryKey: ["managedUsers"] });
      queryClient.invalidateQueries({ queryKey: ["managedUser"] });
      queryClient.invalidateQueries({ queryKey: ["businessUsers"] });
      queryClient.invalidateQueries({ queryKey: ["businessUser"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    setPage(1);
  }, [businessTab, searchQuery, statusFilter]);

  // Status Badge color mapping
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
    <>
      <div className="w-full rounded-xl border border-gray-100 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1 sm:w-auto">
          <button
            type="button"
            onClick={() => setBusinessTab("original")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition sm:flex-none ${businessTab === "original" ? "bg-white text-[#2b3674] shadow-sm" : "text-gray-500 hover:text-[#2b3674]"}`}
          >
            Original Business
          </button>
          <button
            type="button"
            onClick={() => setBusinessTab("referred")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition sm:flex-none ${businessTab === "referred" ? "bg-white text-[#2b3674] shadow-sm" : "text-gray-500 hover:text-[#2b3674]"}`}
          >
            Refer Business
          </button>
        </div>

        <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[290px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search business name, category and email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 border-gray-200 bg-white pl-9 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-gray-300 rounded-lg"
            />
          </div>
          {businessTab === "original" && (
            <div className="min-w-0 flex-1 sm:w-[150px] sm:flex-none">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 !w-full text-sm font-medium text-gray-600 border-gray-200 focus:ring-0 focus:ring-offset-0 focus:border-gray-300 rounded-lg bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 shadow-lg">
                <SelectItem value="all" className="text-sm cursor-pointer text-gray-600">Status</SelectItem>
                <SelectItem value="active" className="text-sm cursor-pointer text-gray-600">Active</SelectItem>
                <SelectItem value="pending" className="text-sm cursor-pointer text-gray-600">Pending</SelectItem>
                <SelectItem value="rejected" className="text-sm cursor-pointer text-gray-600">Rejected</SelectItem>
              </SelectContent>
            </Select>
            </div>
          )}
          <AddReferralBusinessDialog
            token={accessToken}
            onCreated={() => {
              void queryClient.invalidateQueries({ queryKey: ["businessUsers"] });
              void queryClient.invalidateQueries({ queryKey: ["referredBusinesses"] });
            }}
          />
        </div>
      </div>

      {/* Main Table Responsive Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          {/* Dark Navy Table Header */}
          <thead>
            <tr className="bg-[#2b3674] text-white text-[11px] font-semibold uppercase tracking-wider">
              <th className="rounded-tl-xl py-3.5 pl-6 pr-4 text-left">Business Name</th>
              <th className="py-3.5 px-4 text-center">Category</th>
              <th className="py-3.5 px-4 text-center">{businessTab === "referred" ? "Referred By" : "Owner"}</th>
              <th className="py-3.5 px-4 text-center">Email</th>
              <th className="px-4 py-3.5 text-center">Created Date</th>
              <th className={`py-3.5 px-4 text-center ${businessTab === "referred" ? "rounded-tr-xl" : ""}`}>{businessTab === "referred" ? "Claim Status" : "Status"}</th>
              {businessTab === "original" && <th className="rounded-tr-xl px-4 py-3.5 text-center">Action</th>}
            </tr>
          </thead>

          {/* Table Body rows */}
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {businessTab === "referred" ? referredBusinesses.map((row) => {
              const email = row.businessEmail || row.email || "";
              const referralId = row.id || row._id || row.listingId || row.businessName;
              const claimStatus = row.claimStatus || "unclaimed";
              return (
                <tr key={referralId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">{row.businessName || "N/A"}</td>
                  <td className="py-4 px-4 text-center"><span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#3b4cb8]">{row.category || "N/A"}</span></td>
                  <td className="py-4 px-4 text-center font-medium text-gray-700">{row.referredBy?.name || "Community member"}</td>
                  <td className="py-4 px-4 text-center">
                    {email ? <a href={`mailto:${email}`} className="break-all text-sm font-medium text-[#3b4cb8] hover:underline">{email}</a> : "N/A"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-center text-gray-700">{formatDate(row.createdAt)}</td>
                  <td className="py-4 px-4 text-center"><span className={`inline-block min-w-[85px] rounded-full border px-3 py-1 text-xs font-semibold ${claimStatus === "claimed" ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]" : "border-[#f59e0b] bg-[#fffbeb] text-[#f59e0b]"}`}>{claimStatus.charAt(0).toUpperCase() + claimStatus.slice(1)}</span></td>
                </tr>
              );
            }) : businesses.map((row) => (
              <tr
                key={row._id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                {/* Business Name Column */}
                <td className="py-4 pl-6 pr-4 font-semibold">
                  <span className="text-[#3b4cb8] cursor-pointer hover:underline">
                      {row.businessProfile?.businessName || row.businessName || "N/A"}
                  </span>
                </td>

                {/* Category Badge Column */}
                <td className="py-4 px-4 text-center">
                  <span className="px-2.5 py-1 text-xs font-medium bg-[#eef2ff] text-[#3b4cb8] rounded-md">
                    {row.category || "N/A"}
                  </span>
                </td>

                {/* Owner Column */}
                <td className="py-4 px-4 text-center text-gray-700 font-medium">
                  {[row.firstName, row.lastName].filter(Boolean).join(" ") ||
                    row.email}
                </td>

                {/* Email Column */}
                <td className="py-4 px-4 text-center">
                  <a
                    href={`mailto:${row.email}`}
                    className="break-all text-sm font-medium text-[#3b4cb8] hover:underline"
                  >
                    {row.email}
                  </a>
                </td>

                <td className="whitespace-nowrap px-4 py-4 text-center text-gray-700">
                  {formatDate(row.createdAt)}
                </td>
                {/* Status Column */}
                <td className="py-4 px-4 text-center">
                  <span
                    className={`inline-block min-w-[85px] px-3 py-1 text-xs font-semibold rounded-full border text-center ${getStatusStyles(row.status.toLowerCase())}`}
                  >
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </td>

                {/* Action Buttons Column */}
                <td className="py-4 pl-4 pr-6">
                  <div className="flex items-center justify-center gap-2">
                    {row.status.toLowerCase() !== "active" && (
                      <button
                        type="button"
                        disabled={updateStatusMutation.isPending}
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: row._id,
                            status: "active",
                          })
                        }
                        className="h-7 cursor-pointer px-3 text-xs font-semibold text-white bg-[#22c55e] hover:bg-green-600 rounded-md transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {row.status.toLowerCase() === "rejected"
                          ? "Activate"
                          : "Approve"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setBusinessToReject({
                          id: row._id,
                          name:
                            row.businessProfile?.businessName ||
                            row.businessName ||
                            row.username ||
                            [row.firstName, row.lastName]
                              .filter(Boolean)
                              .join(" ") ||
                            row.email,
                        })
                      }
                      className="h-7 cursor-pointer rounded-md bg-[#dc2626] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBusinessId(row._id)}
                      aria-label={`View ${row.username || row.email}`}
                      className="ml-1 cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] shadow-sm transition-colors hover:border-[#2b3674] hover:bg-[#eef2ff]"
                    >
                      <Eye className="w-4 h-4 stroke-[2]" />
                    </button>
                    <a
                      href={`mailto:${row.email}`}
                      aria-label={`Email ${row.username || row.email}`}
                      title={`Email ${row.email}`}
                      className="cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] shadow-sm transition-colors hover:border-[#2b3674] hover:bg-[#eef2ff]"
                    >
                      <Mail className="h-4 w-4 stroke-[2]" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {(businessTab === "referred" ? referredBusinesses.length : businesses.length) === 0 && (
              <tr>
                <td
                  colSpan={businessTab === "referred" ? 6 : 7}
                  className="py-8 text-center text-sm font-medium text-gray-500"
                >
                  {businessTab === "referred" ? "No referred businesses found" : "No businesses found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Part */}
      <Pagination
        page={page}
        limit={limit}
        total={businessTab === "referred" ? totalReferredBusinesses : totalBusinesses}
        currentCount={businessTab === "referred" ? referredBusinesses.length : businesses.length}
        onPageChange={setPage}
      />
      </div>

      {selectedBusinessId && (
        <ViewBusiness
          isOpen
          onClose={() => setSelectedBusinessId(null)}
          businessId={selectedBusinessId}
        />
      )}

      <RejectModal
        isOpen={businessToReject !== null}
        onClose={() => !rejectMutation.isPending && setBusinessToReject(null)}
        onConfirm={(reason) =>
          businessToReject &&
          !rejectMutation.isPending &&
          rejectMutation.mutate({
            id: businessToReject.id,
            reason,
          })
        }
        itemName={businessToReject?.name || "this business"} 
        isRejecting={rejectMutation.isPending}
      />
    </>
  );
}
