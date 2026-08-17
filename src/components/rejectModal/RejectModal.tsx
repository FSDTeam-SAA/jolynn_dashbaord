"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RejectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  itemName: string;
  isRejecting?: boolean;
};

export default function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isRejecting = false,
}: RejectModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isRejecting && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[90%] max-w-[450px] gap-0 rounded-2xl border-0 bg-white p-0 shadow-2xl"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
      >
        <div className="h-2 rounded-t-2xl bg-[#dc2626]" />
        <form onSubmit={handleSubmit} className="p-7">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#dc2626]">
            <AlertCircle className="h-7 w-7" />
          </div>
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle className="text-xl font-bold text-[#292D73]">
              Reject Business
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to reject <strong>{itemName}</strong>? Please provide a reason below.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 text-left">
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setError("");
              }}
              placeholder="Enter reason for rejection..."
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#292D73] focus:outline-none focus:ring-1 focus:ring-[#292D73] resize-none"
            />
            {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
          </div>

          <DialogFooter className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={isRejecting}
              onClick={onClose}
              className="h-10 cursor-pointer border-gray-200 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isRejecting}
              className="h-10 cursor-pointer bg-[#dc2626] text-white hover:bg-red-700 disabled:opacity-60"
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
