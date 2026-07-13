"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CloseButton } from "./AddSponsor";

interface ViewSponsorProps {
  isOpen: boolean;
  onClose: () => void;
  sponsorId: number;
  sponsor: { title: string; content: string; image: string; status: string };
}

export default function ViewSponsor({
  isOpen,
  onClose,
  sponsorId,
  sponsor,
}: ViewSponsorProps) {
  // Use sponsorId here when connecting the single-sponsor API query.
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
        <div className="space-y-6">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
