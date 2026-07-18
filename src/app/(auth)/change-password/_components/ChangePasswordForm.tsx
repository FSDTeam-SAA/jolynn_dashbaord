"use client";

import React, { FormEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CircleCheck, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function ChangePasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: async (bodyData: { email: string; newPassword: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMessage = Array.isArray(data?.message)
          ? data.message[0]
          : data?.message;
        throw new Error(errorMessage || "Password reset failed");
      }

      return data;
    },
    onSuccess: () => {
      setIsSuccessModalOpen(true);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Password reset failed");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast.error("Email address is missing. Please verify your email again.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetPasswordMutation.mutate({ email, newPassword });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)),linear-gradient(180deg,#292D73_0%,#91C7D9_50%,#CBE4E3_100%)]">
      <div className="bg-white p-10 rounded-[16px] shadow-2xl w-full max-w-xl flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6 w-[90px] h-[90px] relative">
          <Image
            src="/images/logo_images.png"
            alt="Logo"
            width={90}
            height={90}
            className="object-contain"
          />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#232B5C] mb-10 text-center">
          Change Password
        </h1>

        {/* Form */}
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          {/* Create New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-base font-semibold leading-[100%] text-[#4365D0]"
            >
              Create New Password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="pr-10 w-full rounded-[8px] h-[51px] border-[#DCE3EE] focus:ring-[#168CF8] focus:border-[#168CF8] shadow-[0px_0px_10px_0px_#00000026]"
              />
              {!newPassword && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 pt-[5px] leading-none text-muted-foreground">
                  ********
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowNewPassword((previous) => !previous)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9EA7BC]"
              >
                {showNewPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-base font-semibold leading-[100%] text-[#4365D0]"
            >
              Confirm New Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="pr-10 w-full rounded-[8px] h-[51px] border-[#DCE3EE] focus:ring-[#168CF8] focus:border-[#168CF8] shadow-[0px_0px_10px_0px_#00000026]"
              />
              {!confirmPassword && (
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 pt-[5px] leading-none text-muted-foreground">
                  ********
                </span>
              )}
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9EA7BC]"
              >
                {showConfirmPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full h-[51px] bg-[#30386C] hover:bg-[#252C5C] text-white font-semibold text-base leading-[100%] rounded-md transition-colors cursor-pointer"
            >
              {resetPasswordMutation.isPending
                ? "Changing Password..."
                : "Change Password"}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={isSuccessModalOpen}>
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          className="max-w-md overflow-hidden border-0 rounded-[16px] p-0 shadow-2xl"
        >
          <div className="h-2 bg-[linear-gradient(90deg,#292D73_0%,#4365D0_55%,#91C7D9_100%)]" />
          <div className="px-8 pt-7 pb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F1FF] text-[#4365D0]">
              <CircleCheck className="h-9 w-9" strokeWidth={2} />
            </div>
            <DialogHeader className="items-center text-center sm:text-center">
              <DialogTitle className="text-2xl leading-tight text-[#292D73]">
                Password Changed Successfully
              </DialogTitle>
              <DialogDescription className="max-w-sm pt-2 text-base leading-6 text-[#5E667A]">
                Your password has been changed. Please log in again using your
                new password.
              </DialogDescription>
            </DialogHeader>
            <Button
              type="button"
              onClick={() => router.replace("/signin")}
              className="mt-7 h-[51px] w-full rounded-md bg-[#30386C] text-base font-semibold text-white hover:bg-[#252C5C] cursor-pointer"
            >
              Go to Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChangePasswordForm;
