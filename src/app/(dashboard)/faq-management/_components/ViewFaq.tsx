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
import type { Faq } from "./FAQList";

interface ViewFaqProps {
  isOpen: boolean;
  onClose: () => void;
  faqId: string;
}

export default function ViewFaq({ isOpen, onClose, faqId }: ViewFaqProps) {
  const { data: response, isPending } = useQuery<{ success: boolean; message: string; data: Faq }>({
    queryKey: ["faq", faqId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/faq/${faqId}`);
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch FAQ");
      return data;
    },
    enabled: isOpen,
  });
  const faq = response?.data;
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[85vh] w-[92%] max-w-[650px] overflow-y-auto gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        showCloseButton={false}
        data-faq-id={faqId}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <DialogTitle className="text-xl font-bold text-gray-800">
            FAQ Details
          </DialogTitle>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close FAQ details"
            className="rounded-md p-1 text-gray-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        {isPending && <div className="py-8 text-center text-sm text-gray-500">Loading FAQ details...</div>}
        {faq && <div className="space-y-6">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-700">Question</h3>
            <p className="text-sm text-gray-500">{faq.question}</p>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-700">Answer</h3>
            <div
              className="text-sm leading-6 text-gray-500"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </div>
        </div>}
      </DialogContent>
    </Dialog>
  );
}
