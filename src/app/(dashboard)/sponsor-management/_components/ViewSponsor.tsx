"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CloseButton } from "./AddSponsor";
import { useQuery } from "@tanstack/react-query";
import type { Sponsor } from "./SponsorManagementList";

interface ViewSponsorProps {
  isOpen: boolean;
  onClose: () => void;
  sponsorId: string;
}

export default function ViewSponsor({
  isOpen,
  onClose,
  sponsorId,
}: ViewSponsorProps) {
  const { data: response, isPending } = useQuery<{ success: boolean; message: string; data: Sponsor }>({
    queryKey: ["sponsor", sponsorId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sponsor/${sponsorId}`);
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch sponsor");
      return data;
    },
    enabled: isOpen,
  });
  const sponsor = response?.data;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[85vh] w-[94%] max-w-[900px] overflow-y-auto gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        showCloseButton={false}
        data-sponsor-id={sponsorId}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-bold text-gray-800">
            Sponsor Details
          </DialogTitle>
          <CloseButton onClose={onClose} />
        </DialogHeader>
        {isPending && <div className="py-8 text-center text-sm text-gray-500">Loading sponsor details...</div>}
        {sponsor && <div className="space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-700">Title</h3>
            <p className="text-sm text-gray-500">{sponsor.title}</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-700">Content</h3>
            <div
              className="text-sm leading-6 text-gray-500"
              dangerouslySetInnerHTML={{ __html: sponsor.content }}
            />
          </div>
          {sponsor.image && (
            <div className="overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sponsor.image}
                alt={sponsor.title}
                className="h-48 w-80 object-cover"
              />
            </div>
          )}
          <div className="space-y-1.5"><h3 className="text-sm font-semibold text-gray-700">Status</h3><p className="text-sm capitalize text-gray-500">{sponsor.status ?? "active"}</p></div>
        </div>}
      </DialogContent>
    </Dialog>
  );
}
