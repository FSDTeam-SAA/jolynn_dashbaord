"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isDeleting?: boolean;
};

function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting = false,
}: DeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[90%] max-w-[430px] gap-0 rounded-2xl border-0 bg-white p-0 shadow-2xl"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
      >
        <div className="h-2 rounded-t-2xl bg-[#dc2626]" />
        <div className="p-7">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#dc2626]">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle className="text-xl text-[#292D73]">
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to delete <strong>{itemName}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={onClose}
              className="h-10 cursor-pointer border-gray-200 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="h-10 cursor-pointer bg-[#dc2626] text-white hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteModal;
