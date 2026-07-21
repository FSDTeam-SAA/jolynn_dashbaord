"use client";

import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPageConfig } from "@/lib/page-config";
import { useAdminProfile } from "@/hooks/use-admin-profile";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  const pageInfo = getPageConfig(pathname);

  const { data: session } = useSession();

  const user = session?.user as {
    name?: string;
    email?: string;
    accessToken?: string;
    token?: string;
  } | undefined;

  const accessToken = user?.accessToken ?? user?.token;
  const { data: profile } = useAdminProfile(accessToken);
  const profileName = profile?.fullName || [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  const name = profileName || user?.name || "Admin User";
  const email = profile?.email || user?.email || "";
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 left-0 z-30 h-[100px] flex items-center justify-between px-4 md:px-6 bg-[#FFFFFF]">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>

        <div className="lg:ml-[295px]">
          <h1 className="text-2xl font-bold leading-[150%] text-[#000000]">
            {pageInfo.title}
          </h1>

          <p className="hidden md:block text-sm text-[#2A2F4D]">
            {pageInfo.description}
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="relative flex items-center">
        <div
          ref={avatarRef}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="hidden max-w-[220px] text-right sm:block">
            <p className="truncate text-sm font-semibold text-[#292D73]">{name}</p>
            <p className="truncate text-[11px] text-gray-500">{email}</p>
          </div>

          <Avatar className="h-10 w-10 border border-[#292D73]/15">
            <AvatarImage src={profile?.profilePicture || ""} alt={name} className="object-cover" />
            <AvatarFallback className="bg-[#eef2ff] font-semibold text-[#292D73]">{initials || "A"}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
