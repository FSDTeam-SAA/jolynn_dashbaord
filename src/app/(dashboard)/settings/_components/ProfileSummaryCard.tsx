"use client";

import React, { ChangeEvent } from "react";
import { Pencil } from "lucide-react";

interface ProfileSummaryCardProps {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  since?: string | null;
  image?: string;
  disabled?: boolean;
  onImageChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function ProfileSummaryCard({ name = "User", email = "N/A", phone = "N/A", location = "N/A", since, image, disabled, onImageChange }: ProfileSummaryCardProps) {
  const formattedSince = since
    ? new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(since))
    : "N/A";

  return (
    <aside className="min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm lg:min-h-[430px]">
      <div className="min-w-0 flex flex-col items-center text-center">
        <div className="relative">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#eef2ff] text-2xl font-bold text-[#292D73] shadow-md">{initials(name)}</div>
          )}
          {onImageChange && (
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#292D73] text-white shadow-sm">
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only">Change profile picture</span>
              <input type="file" accept="image/png,image/jpeg" disabled={disabled} onChange={onImageChange} className="hidden" />
            </label>
          )}
        </div>
        <h2 className="mt-4 max-w-full break-words text-xl font-bold text-[#292D73]">
          {name}
        </h2>
        <p className="max-w-full break-all text-xs leading-5 text-gray-500">
          {email}
        </p>
      </div>
      <dl className="mt-7 min-w-0 space-y-4 text-sm">
        <Summary label="Name" value={name} />
        <Summary label="Email" value={email} />
        <Summary label="Phone" value={phone || "N/A"} />
        <Summary label="Location" value={location || "N/A"} />
        <Summary label="Since" value={formattedSince} />
      </dl>
    </aside>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[70px_minmax(0,1fr)] gap-1 text-gray-500">
      <dt className="font-semibold text-gray-700">{label}:</dt>
      <dd className="min-w-0 break-words [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
