"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type LogoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
};

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogoutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[90%] max-w-[430px] gap-0 rounded-2xl border-0 bg-white p-0 shadow-2xl"
        overlayClassName="bg-slate-950/40 backdrop-blur-[3px]"
      >
        <div className="h-2 rounded-t-2xl bg-[linear-gradient(90deg,#292D73_0%,#4365D0_100%)]" />
        <div className="p-7">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef2ff] text-[#292D73]">
            <LogOut className="h-7 w-7" />
          </div>
          <DialogHeader className="items-center text-center sm:text-center">
            <DialogTitle className="text-xl text-[#292D73]">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-6 text-gray-500">
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={isLoggingOut}
              onClick={onClose}
              className="h-10 cursor-pointer border-gray-200 text-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isLoggingOut}
              onClick={onConfirm}
              className="h-10 cursor-pointer bg-[#292D73] text-white hover:bg-[#20245f]"
            >
              {isLoggingOut ? "Logging out..." : "Log Out"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
