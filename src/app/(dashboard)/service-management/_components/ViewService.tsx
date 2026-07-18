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

interface ViewServiceProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
}

type ServiceDetailsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    _id: string;
    ownerId: string;
    title: string;
    description: string;
    logo?: { url?: string; publicId?: string };
    status?: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
  };
};

export default function ViewService({
  isOpen,
  onClose,
  serviceId,
}: ViewServiceProps) {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;

  const { data: serviceResponse, isPending } =
    useQuery<ServiceDetailsResponse>({
      queryKey: ["service", serviceId, accessToken],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/service/my-services/${serviceId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await response.json();
        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Failed to fetch service details");
        }
        return data;
      },
      enabled: isOpen && Boolean(serviceId) && Boolean(accessToken),
    });

  const service = serviceResponse?.data;
  const status = service?.status ?? "active";
  const statusStyles =
    status === "active"
      ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]"
      : "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[90%] max-w-[560px] gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl focus:outline-none"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        showCloseButton={false}
        data-service-id={serviceId}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-gray-800">
            Service Details
          </DialogTitle>
          <button type="button" onClick={onClose} aria-label="Close service details" className="rounded-md p-1 text-gray-700 transition-colors hover:bg-slate-100 focus:outline-none">
            <X className="h-4 w-4 stroke-[2.5]" />
          </button>
        </DialogHeader>

        {isPending && <div className="py-8 text-center text-sm font-medium text-gray-500">Loading service details...</div>}

        {service && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {service.logo?.url && (
              <div className="sm:col-span-2">
                <Image src={service.logo.url} alt={service.title} width={64} height={64} className="h-16 w-16 rounded-lg object-cover" />
              </div>
            )}
            <Detail label="Service Provider Name" value={service.title} />
            <Detail label="Owner ID" value={service.ownerId} />
            <div className="sm:col-span-2"><Detail label="Description" value={service.description} /></div>
            <Detail label="Created" value={new Date(service.createdAt).toLocaleDateString()} />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-gray-700">Status</span>
              <div><span className={`inline-block min-w-[85px] rounded-full border px-3 py-1 text-center text-xs font-semibold capitalize ${statusStyles}`}>{status}</span></div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <span className="break-words text-sm font-medium text-gray-400">{value}</span>
    </div>
  );
}
