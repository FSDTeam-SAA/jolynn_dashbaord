"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type BusinessListResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: Array<{
    _id: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    email?: string;
    status: string;
    createdAt: string;
  }>;
};

export default function NewActionsAndRegistration() {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;

  const { data: businessResponse } = useQuery<BusinessListResponse>({
    queryKey: ["latestBusinesses", accessToken],
    queryFn: async () => {
      const query = new URLSearchParams({
        role: "businessOwner",
        limit: "5",
        page: "1",
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user?${query}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch latest businesses");
      }

      return data;
    },
    enabled: Boolean(accessToken),
  });

  const latestBusinesses =
    businessResponse?.data.map((business) => ({
      id: business._id,
      name:
        business.businessName ||
        [business.firstName, business.lastName]
          .filter(Boolean)
          .join(" ") ||
        business.email ||
        "Unnamed business",
      status:
        business.status.charAt(0).toUpperCase() + business.status.slice(1),
    })) ?? [];

  return (
    <div className="mt-10 w-full p-1">
      <Card className="w-full rounded-xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-5">
          <CardTitle className="text-base font-bold text-[#1e266e] tracking-tight">
            Latest Businesses
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
            {latestBusinesses.map((business) => (
              <div
                key={business.id}
                className="flex items-center justify-between py-4 text-sm font-medium text-gray-800"
              >
                <span>{business.name}</span>
                <span className="px-3 py-1 text-xs font-semibold text-[#d97706] bg-[#fef3c7] rounded-full tracking-wide">
                  {business.status}
                </span>
              </div>
            ))}
            {latestBusinesses.length === 0 && (
              <div className="py-4 text-sm font-medium text-gray-500">
                No businesses found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
