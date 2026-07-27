"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ProfileSummaryCard from "./ProfileSummaryCard";

export interface SettingsProfile {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  username?: string;
  gender: string;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt?: string;
  address?: string;
  country?: string;
  state?: string;
  postcode?: string;
}

interface ProfileResponse {
  status?: boolean;
  success?: boolean;
  message?: string;
  data: SettingsProfile;
}

function getApiBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!baseUrl) throw new Error("Backend API URL is not configured.");
  return baseUrl.replace(/\/$/, "");
}

export default function PersonalInfo() {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File>();
  const [profileImagePreview, setProfileImagePreview] = useState("");

  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const response = await fetch(`${getApiBaseUrl()}/user/profile`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (
        !response.ok ||
        data?.success === false ||
        data?.status === false ||
        !data?.data
      )
        throw new Error(data?.message || "Unable to load profile.");
      return data.data;
    },
  });

  const populateForm = (user: SettingsProfile) => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setPhone(user.phoneNumber || "");
    setLocation(user.state || user.country || "");
    setPostalCode(user.postcode || "");
    setProfileImagePreview(user.profilePicture || "");
  };

  useEffect(() => {
    if (profileQuery.data) {
      populateForm(profileQuery.data);
      setProfileImageFile(undefined);
    }
  }, [profileQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("phoneNumber", phone.trim());
      formData.append("state", location.trim());
      formData.append("postcode", postalCode.trim());
      if (profileImageFile) {
        formData.append(
          "profilePicture",
          profileImageFile,
          profileImageFile.name,
        );
      }

      const response = await fetch(`${getApiBaseUrl()}/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });
      const profileData = (await response
        .json()
        .catch(() => null)) as ProfileResponse | null;
      if (
        !response.ok ||
        profileData?.success === false ||
        profileData?.status === false
      )
        throw new Error(profileData?.message || "Unable to update profile.");
      return profileData;
    },
    onSuccess: async (data) => {
      toast.success(data?.message || "Profile updated successfully.");
      setProfileImageFile(undefined);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: unknown) =>
      toast.error(
        error instanceof Error ? error.message : "Unable to update profile.",
      ),
  });

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfileImagePreview(String(reader.result));
    reader.readAsDataURL(file);
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim()) return toast.error("First name is required.");
    if (!accessToken) return toast.error("You are not authorized.");
    updateProfileMutation.mutate();
  };
  const user = profileQuery.data;
  const fullName =
    `${firstName} ${lastName}`.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "User";
  const disabled = profileQuery.isLoading || updateProfileMutation.isPending;
  const inputClass =
    "h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-[#CD9B46] focus:ring-2 focus:ring-[#CD9B46]/15 disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <ProfileSummaryCard
        name={fullName}
        email={email || user?.email}
        phone={phone}
        location={location}
        since={user?.createdAt}
        image={profileImagePreview}
        disabled={disabled}
        onImageChange={handleImage}
      />
      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-bold text-[#292D73]">
          Personal Information
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your personal information and profile details.
        </p>
        {profileQuery.error && (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {profileQuery.error instanceof Error
              ? profileQuery.error.message
              : "Unable to load profile."}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="First Name">
              <input
                required
                value={firstName}
                disabled={disabled}
                onChange={(event) => setFirstName(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Last Name">
              <input
                value={lastName}
                disabled={disabled}
                onChange={(event) => setLastName(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Email Address">
              <input
                type="email"
                value={email}
                disabled
                className={inputClass}
              />
            </Field>
            <Field label="Phone Number">
              <input
                type="tel"
                value={phone}
                disabled={disabled}
                onChange={(event) => setPhone(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Location">
              <input
                value={location}
                disabled={disabled}
                onChange={(event) => setLocation(event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Postal Code">
              <input
                value={postalCode}
                disabled={disabled}
                onChange={(event) => setPostalCode(event.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => user && populateForm(user)}
              disabled={disabled}
              className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={disabled}
              className="h-10 rounded-md bg-[#292D73] px-5 text-sm font-semibold text-white hover:bg-[#20245f] disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-gray-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
