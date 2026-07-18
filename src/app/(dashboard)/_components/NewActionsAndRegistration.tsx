"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type RecentActivityResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    latestReports: Array<{
      _id: string;
      userId?: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
      serviceId?: {
        title?: string;
      };
      message: string;
      createdAt: string;
    }>;
    newRegistrations: Array<{
      _id: string;
      firstName?: string;
      lastName?: string;
      businessName?: string;
      email?: string;
      status: string;
      createdAt: string;
    }>;
  };
};

export default function NewActionsAndRegistration() {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;

  const { data: recentActivityResponse } = useQuery<RecentActivityResponse>({
    queryKey: ["recentActivity", accessToken],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/dashboard/recent-activity`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch recent activity");
      }

      return data;
    },
    enabled: Boolean(accessToken),
  });

  const pendingActions =
    recentActivityResponse?.data.latestReports.map((report) => {
      const reporterName = [
        report.userId?.firstName,
        report.userId?.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        id: report._id,
        label: `${reporterName || "A user"} reported ${report.serviceId?.title || "a service"}`,
        count: 1,
      };
    }) ?? [];

  const newRegistrations =
    recentActivityResponse?.data.newRegistrations.map((registration) => ({
      id: registration._id,
      name:
        registration.businessName ||
        [registration.firstName, registration.lastName]
          .filter(Boolean)
          .join(" ") ||
        registration.email ||
        "New registration",
      status:
        registration.status.charAt(0).toUpperCase() +
        registration.status.slice(1),
    })) ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-1 w-full mt-10">
      
      {/* 1. Pending Actions Card */}
      <Card className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-5">
          <CardTitle className="text-base font-bold text-[#1e266e] tracking-tight">
            Pending Actions
          </CardTitle>
          <Link 
            href="/business-management" 
            className="text-xs font-semibold text-[#3b4cb8] hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {pendingActions.map((action) => (
              <div 
                key={action.id} 
                className="flex items-center justify-between py-4 text-sm font-medium text-gray-800"
              >
                <span>{action.label}</span>
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#990000] text-white text-[11px] font-bold">
                  {action.count}
                </span>
              </div>
            ))}
            {pendingActions.length === 0 && (
              <div className="py-4 text-sm font-medium text-gray-500">
                No recent reports
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. New Registrations Card */}
      <Card className="bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-5">
          <CardTitle className="text-base font-bold text-[#1e266e] tracking-tight">
            New Registrations
          </CardTitle>
          <Link 
            href="/user-management" 
            className="text-xs font-semibold text-[#3b4cb8] hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {newRegistrations.map((registration) => (
              <div 
                key={registration.id} 
                className="flex items-center justify-between py-4 text-sm font-medium text-gray-800"
              >
                <span>{registration.name}</span>
                <span className="px-3 py-1 text-xs font-semibold text-[#d97706] bg-[#fef3c7] rounded-full tracking-wide">
                  {registration.status}
                </span>
              </div>
            ))}
            {newRegistrations.length === 0 && (
              <div className="py-4 text-sm font-medium text-gray-500">
                No new registrations
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
