"use client";

import React, { useDeferredValue, useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/pagination/Pagination";
import ViewService from "./ViewService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import DeleteModal from "@/components/deleteModal/DeleteModal";

type Service = {
  _id: string;
  ownerId: string;
  title: string;
  description: string;
  logo?: { url?: string; publicId?: string };
  status?: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

type ServiceListResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: Service[];
};

export default function ServiceManagementList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [serviceToDelete, setServiceToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const limit = 10;
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;

  const { data: serviceResponse } = useQuery<ServiceListResponse>({
    queryKey: ["services", page, statusFilter, deferredSearchQuery],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });
      if (deferredSearchQuery) {
        queryParams.set("searchTerm", deferredSearchQuery);
      }
      if (statusFilter !== "all") {
        queryParams.set("status", statusFilter);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/service?${queryParams.toString()}`
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch services");
      }
      return data;
    },
  });

  const services = serviceResponse?.data ?? [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/service/${id}`,
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
        throw new Error(data?.message || "Failed to update service status");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Service status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["service"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/service/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete service");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Service deleted successfully");
      setServiceToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search service, category, location..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 rounded-lg border-gray-200 bg-white pl-9 text-sm focus-visible:border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="w-full sm:w-[150px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 !w-full rounded-lg border-gray-200 bg-white text-sm font-medium text-gray-600 focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 shadow-lg">
                <SelectItem value="all" className="cursor-pointer text-sm text-gray-600">Status</SelectItem>
                <SelectItem value="active" className="cursor-pointer text-sm text-gray-600">Active</SelectItem>
                <SelectItem value="inactive" className="cursor-pointer text-sm text-gray-600">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Service Provider Name</th>
                <th className="px-4 py-3.5 text-center">Category</th>
                <th className="px-4 py-3.5 text-center">Description</th>
                <th className="px-4 py-3.5 text-center">Created At</th>
                <th className="px-4 py-3.5 text-center">Updated At</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="rounded-tr-xl py-3.5 pl-14 pr-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {services.map((service) => {
                const status = service.status ?? "active";
                return (
                  <tr key={service._id} className="transition-colors hover:bg-slate-50/50">
                    <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">{service.title}</td>
                    <td className="px-4 py-4 text-center"><span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#3b4cb8]">Service</span></td>
                    <td className="max-w-[260px] px-4 py-4 text-center text-gray-700">
                      <span className="line-clamp-2">{service.description}</span>
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-gray-700">
                      {new Date(service.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-700">
                      {new Date(service.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Select
                        value={status}
                        disabled={updateStatusMutation.isPending}
                        onValueChange={(value) =>
                          updateStatusMutation.mutate({ id: service._id, status: value })
                        }
                      >
                        <SelectTrigger className="mx-auto h-8 w-[105px] rounded-full text-xs font-semibold"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            setServiceToDelete({
                              id: service._id,
                              name: service.title,
                            })
                          }
                          className="h-7 cursor-pointer rounded-md bg-[#dc2626] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >Delete</button>
                        <button
                          type="button"
                          onClick={() => setSelectedServiceId(service._id)}
                          aria-label={`View ${service.title}`}
                          className="ml-1 cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] shadow-sm transition-colors hover:border-[#2b3674] hover:bg-[#eef2ff]"
                        ><Eye className="h-4 w-4 stroke-[2]" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {services.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm font-medium text-gray-500">No services found</td></tr>}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={limit}
          total={serviceResponse?.meta.total ?? 0}
          currentCount={services.length}
          onPageChange={setPage}
        />
      </div>

      {selectedServiceId && (
        <ViewService isOpen onClose={() => setSelectedServiceId(null)} serviceId={selectedServiceId} />
      )}

      <DeleteModal
        isOpen={serviceToDelete !== null}
        onClose={() => !deleteMutation.isPending && setServiceToDelete(null)}
        onConfirm={() =>
          serviceToDelete && deleteMutation.mutate(serviceToDelete.id)
        }
        itemName={serviceToDelete?.name || "this service"}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
