"use client";

import React, { useState } from "react";
import { ChevronLeft, KeyRound, UserRound } from "lucide-react";
import PersonalInfo from "./PersonalInfo";
import ChangePassword from "./ChangePassword";

type SettingsView = "menu" | "profile" | "password";

function Settings() {
  const [view, setView] = useState<SettingsView>("menu");

  if (view !== "menu") {
    return (
      <section className="min-h-[calc(100vh-132px)]">
        <button
          type="button"
          onClick={() => setView("menu")}
          className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#292D73]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Settings
        </button>
        {view === "profile" ? <PersonalInfo /> : <ChangePassword />}
      </section>
    );
  }

  return (
    <section className="">
      <SettingsLink
        icon={<UserRound className="h-4 w-4" />}
        label="Profile"
        onClick={() => setView("profile")}
      />
      <SettingsLink
        icon={<KeyRound className="h-4 w-4" />}
        label="Password"
        onClick={() => setView("password")}
      />
    </section>
  );
}

function SettingsLink({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded border border-gray-100 bg-white px-5 py-5 text-left text-sm font-semibold text-[#292D73] shadow-sm transition-all hover:border-[#CD9B46]/50 hover:bg-[#FAF6EE] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CD9B46]/30 mb-10"
    >
      {icon}
      {label}
    </button>
  );
}

export default Settings;
