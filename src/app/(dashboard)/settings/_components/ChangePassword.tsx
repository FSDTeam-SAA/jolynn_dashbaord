"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import ProfileSummaryCard from "./ProfileSummaryCard";
import type { SettingsProfile } from "./PersonalInfo";

interface ChangePasswordResponse {
  success?: boolean;
  status?: boolean;
  message?: string;
}

interface ProfileResponse {
  status?: boolean;
  success?: boolean;
  data?: SettingsProfile;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

function ChangePassword() {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/profile`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = (await response.json().catch(() => null)) as ProfileResponse | null;
      if (!response.ok || !data?.data) throw new Error("Unable to load profile.");
      return data.data;
    },
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword,
        }),
      });

      const data = (await response.json().catch(() => null)) as ChangePasswordResponse | null;

      if (!response.ok || data?.success === false || data?.status === false) {
        throw new Error(data?.message || "Unable to change password.");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Password updated successfully.");
      reset();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Unable to change password.");
    },
  });

  const checks = useMemo(
    () => [
      {
        text: "Password must be at least 6 characters.",
        valid: newPassword.length >= 6,
      },
    ],
    [newPassword],
  );

  const valid =
    currentPassword.length > 0 &&
    checks.every((check) => check.valid) &&
    newPassword === confirmPassword;
  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) return;
    if (!accessToken) return toast.error("You are not authorized.");
    changePasswordMutation.mutate();
  };

  const profile = profileQuery.data;

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ProfileSummaryCard
        name={
          [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
          session?.user?.name ||
          "User"
        }
        email={profile?.email || session?.user?.email || "N/A"}
        phone={profile?.phoneNumber}
        location={profile?.state || profile?.country}
        since={profile?.createdAt}
        image={profile?.profilePicture}
      />
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-bold text-[#292D73]">Change Password</h2>
      <p className="mt-1 text-sm text-gray-500">
        Manage your account preferences, security settings, and privacy options.
      </p>

      <form onSubmit={handleSubmit} className="mt-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={visible.current}
            disabled={changePasswordMutation.isPending}
            onToggle={() =>
              setVisible((state) => ({ ...state, current: !state.current }))
            }
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            visible={visible.next}
            disabled={changePasswordMutation.isPending}
            onToggle={() =>
              setVisible((state) => ({ ...state, next: !state.next }))
            }
          />
          <div className="sm:col-span-2">
            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={visible.confirm}
              disabled={changePasswordMutation.isPending}
              onToggle={() =>
                setVisible((state) => ({ ...state, confirm: !state.confirm }))
              }
            />
          </div>
        </div>

        <ul className="mt-5 space-y-2 text-xs">
          {checks.map((check) => (
            <li
              key={check.text}
              className={`flex items-center gap-1.5 ${newPassword && !check.valid ? "text-red-500" : check.valid ? "text-emerald-600" : "text-gray-500"}`}
            >
              {check.valid ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {check.text}
            </li>
          ))}
          {confirmPassword && newPassword !== confirmPassword && (
            <li className="flex items-center gap-1.5 text-red-500">
              <X className="h-3 w-3" />
              Passwords do not match.
            </li>
          )}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={reset}
            disabled={changePasswordMutation.isPending}
            className="h-10 cursor-pointer rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Discard Changes
          </button>
          <button
            type="submit"
            disabled={!valid || changePasswordMutation.isPending}
            className="h-10 cursor-pointer rounded-md bg-[#292D73] px-5 text-sm font-semibold text-white hover:bg-[#20245f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {changePasswordMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
      </section>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  disabled = false,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-gray-700">
      <span>{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          required
          placeholder="••••••••"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 pr-11 text-sm text-gray-700 outline-none transition-colors placeholder:tracking-[3px] placeholder:text-gray-400 focus:border-[#CD9B46] focus:ring-2 focus:ring-[#CD9B46]/15 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-[#292D73] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </span>
    </label>
  );
}

export default ChangePassword;
