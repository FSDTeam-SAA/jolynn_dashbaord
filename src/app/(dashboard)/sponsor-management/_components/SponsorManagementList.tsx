"use client";

import React, { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/pagination/Pagination";
import ViewSponsor from "./ViewSponsor";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type Sponsor = {
  _id: string;
  title: string;
  content: string;
  image?: string;
  imagePublicId?: string;
  status?: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

type SponsorResponse = {
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: Sponsor[];
};

export default function SponsorManagementList() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewSponsorId, setViewSponsorId] = useState<string | null>(null);
  const [sponsorToDelete, setSponsorToDelete] = useState<Sponsor | null>(null);
  const limit = 10;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;

  const { data: response } = useQuery<SponsorResponse>({
    queryKey: ["sponsors", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sponsor?${params}`,
      );
      const data = await res.json();
      if (!res.ok || !data?.success)
        throw new Error(data?.message || "Failed to fetch sponsors");
      return data;
    },
  });
  const sponsors = response?.data ?? [];

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const body = new FormData();
      body.append("status", status);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sponsor/${id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success)
        throw new Error(data?.message || "Failed to update status");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Status updated");
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["sponsor"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sponsor/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success)
        throw new Error(data?.message || "Failed to delete sponsor");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Sponsor deleted");
      setSponsorToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["sponsors"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => setPage(1), [statusFilter]);

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
        <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[175px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="!h-10 !w-full rounded-[8px] border-gray-200 bg-white text-sm font-medium text-gray-600 shadow-sm focus:ring-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link
            href="/sponsor-management/add"
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#2b3674] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#20285f]"
          >
            <Plus className="h-4 w-4" /> Add Sponsor
          </Link>
        </div>
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Sponsor Name</th>
                <th className="px-4 py-3.5 text-center">Content</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="rounded-tr-xl py-3.5 pl-16 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {sponsors.map((sponsor) => {
                const status = sponsor.status ?? "active";
                return (
                  <tr key={sponsor._id} className="hover:bg-slate-50/50">
                    <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">
                      {sponsor.title}
                    </td>
                    <td className="max-w-[500px] px-4 py-4 text-center text-gray-600">
                      <div
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: sponsor.content }}
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Select
                        value={status}
                        disabled={statusMutation.isPending}
                        onValueChange={(value) =>
                          statusMutation.mutate({
                            id: sponsor._id,
                            status: value,
                          })
                        }
                      >
                        <SelectTrigger className="mx-auto h-8 w-[105px] rounded-full text-xs font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/sponsor-management/edit/${sponsor._id}`}
                          className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setViewSponsorId(sponsor._id)}
                          className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSponsorToDelete(sponsor)}
                          className="rounded-md border border-red-200 p-1.5 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!sponsors.length && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-gray-500"
                  >
                    No sponsors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          limit={limit}
          total={response?.meta.total ?? 0}
          currentCount={sponsors.length}
          onPageChange={setPage}
        />
      </div>
      {viewSponsorId && (
        <ViewSponsor
          isOpen
          onClose={() => setViewSponsorId(null)}
          sponsorId={viewSponsorId}
        />
      )}
      <DeleteModal
        isOpen={!!sponsorToDelete}
        onClose={() => !deleteMutation.isPending && setSponsorToDelete(null)}
        onConfirm={() =>
          sponsorToDelete && deleteMutation.mutate(sponsorToDelete._id)
        }
        itemName={sponsorToDelete?.title || "this sponsor"}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
