"use client";

import React from "react";
import Link from "next/link";
import { Building2, MoreHorizontal, Users2, Files } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type OverviewResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    totalBusinesses: number;
    pendingApprovals: number;
    activeUsers: number;
    totalReports: number;
  };
};

function OverviewState() {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;

  const { data: overviewData } = useQuery<OverviewResponse>({
    queryKey: ["overviewData", accessToken],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/dashboard/cards`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch overview data");
      }

      return data;
    },
    enabled: Boolean(accessToken),
  });

  const overview = overviewData?.data;

  const stats = [
    {
      title: "Total Businesses",
      value: overview?.totalBusinesses ?? 0,
      icon: Building2,
      href: "/business-management",
    },
    {
      title: "Pending Approvals",
      value: overview?.pendingApprovals ?? 0,
      icon: MoreHorizontal,
      href: "/service-management",
    },
    {
      title: "Active Users",
      value: overview?.activeUsers ?? 0,
      icon: Users2,
      href: "/user-management",
    },
    {
      title: "Reports",
      value: overview?.totalReports ?? 0,
      icon: Files,
      href: "/report-management",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Link
            key={index} 
            href={stat.href}
            aria-label={`View ${stat.title}`}
            className="flex items-center justify-between rounded-[8px] bg-white px-4 py-7 shadow-[0px_4px_6px_0px_#0000001A] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0px_8px_16px_0px_#0000001F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b4cb8] focus-visible:ring-offset-2"
          >
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-500 tracking-wide">
                {stat.title}
              </span>
              <span className="text-3xl font-bold text-[#1e266e] tracking-tight">
                {stat.value.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#eef2ff] text-[#3b4cb8]">
              <Icon className="w-6 h-6 stroke-[1.75]" />
            </div>
          </Link>
        )
      })}
    </div>
  );
}

export default OverviewState;
