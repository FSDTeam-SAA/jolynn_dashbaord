"use client";

import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SuspendUserModalProps = {
  isOpen: boolean;
  userName: string;
  isSuspending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SuspendUserModal({
  isOpen,
  userName,
  isSuspending,
  onClose,
  onConfirm,
}: SuspendUserModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[90%] max-w-[430px] gap-0 rounded-2xl border-0 bg-white p-0 shadow-2xl"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
      >
        <div className="h-2 rounded-t-2xl bg-amber-500" />
        <div className="p-7">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <Ban className="h-7 w-7" />
          </div>
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle className="text-xl text-[#292D73]">
              Confirm Suspension
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to suspend <strong>{userName}</strong>? The
              user will no longer have active account access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSuspending}
              onClick={onClose}
              className="h-10 cursor-pointer border-gray-200 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSuspending}
              onClick={onConfirm}
              className="h-10 cursor-pointer bg-amber-500 text-white hover:bg-amber-600"
            >
              {isSuspending ? "Suspending..." : "Suspend"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
