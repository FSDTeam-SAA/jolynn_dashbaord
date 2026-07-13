"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  CircleHelp,
  CreditCard,
  GraduationCap,
  Handshake,
  LayoutDashboard,
  LogOut,
  MessageSquareWarning,
  Settings,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard Overview", href: "/", icon: LayoutDashboard },
  {
    name: "Business Management",
    href: "/business-management",
    icon: CreditCard,
  },
  {
    name: "Service Management",
    href: "/service-management",
    icon: Wrench,
  },
  {
    name: "Sponsor Management",
    href: "/sponsor-management",
    icon: Handshake,
  },
  {
    name: "FAQ Management",
    href: "/faq-management",
    icon: CircleHelp,
  },
  {
    name: "Report Management",
    href: "/report-management",
    icon: MessageSquareWarning,
  },
  {
    name: "Job Management",
    href: "/job-management",
    icon: GraduationCap,
  },
  {
    name: "User Management",
    href: "/user-management",
    icon: UserRound,
  },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const name = session?.user?.name || "Admin User";
  const email = session?.user?.email || "admin@example.com";
  const username = `@${email.split("@")[0]}`;
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !profileButtonRef.current?.contains(target) &&
        !profileMenuRef.current?.contains(target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-[280px] lg:w-[350px] bg-[#292D73] z-50 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Mobile Close Button */}
        <div className="absolute right-4 top-4 lg:hidden">
          <button onClick={() => setOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo */}
        <div className="h-[80px] flex items-center justify-center">
          <Image
            src="/images/logo_images.png"
            alt="Logo"
            width={64}
            height={64}
            priority
            className="object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 flex flex-col items-center px-3 overflow-y-auto mt-3">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded px-4 py-[12px] text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-white text-[#292D73]"
                    : "text-white hover:bg-white hover:text-[#292D73]",
                )}
              >
                <item.icon className="h-5 w-5" />

                <span
                  className={cn("text-base", isActive ? "font-semibold" : "")}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Profile menu */}
        <div className="relative border-t border-white/10 p-3">
          {isProfileMenuOpen && (
            <div
              ref={profileMenuRef}
              className="absolute bottom-[76px] right-3 z-[60] w-[190px] overflow-hidden rounded-lg border border-gray-100 bg-white p-1.5 shadow-xl lg:bottom-3 lg:left-[calc(100%-4px)] lg:right-auto"
            >
              <Link
                href="/settings"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setOpen(false);
                }}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-[#292D73] transition-colors hover:bg-[#eef2ff]"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}

          <button
            ref={profileButtonRef}
            type="button"
            onClick={() => setIsProfileMenuOpen((current) => !current)}
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="menu"
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left text-white transition-colors hover:bg-white/10"
          >
            <Avatar className="h-10 w-10 border border-white/30 bg-white">
              <AvatarImage src={session?.user?.image || ""} alt={name} />
              <AvatarFallback className="bg-white text-sm font-semibold text-[#292D73]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{name}</span>
              <span className="block truncate text-[11px] text-white/70">{username}</span>
            </span>
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                isProfileMenuOpen && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>
    </>
  );
}
