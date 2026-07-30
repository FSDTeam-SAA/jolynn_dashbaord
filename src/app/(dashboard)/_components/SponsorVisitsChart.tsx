"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type MonthlySponsorVisitsResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Array<{
    month: string;
    year: number;
    count: number;
  }>;
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: { name: string };
  }>;
};

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="flex min-w-[120px] flex-col gap-0.5 rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-xl">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          This Month
        </span>
        <span className="text-base font-bold text-gray-900">
          {payload[0].value} Visits
        </span>
        <span className="text-[11px] font-medium text-gray-400">
          {payload[0].payload.name}
        </span>
      </div>
    );
  }

  return null;
};

export default function SponsorVisitsChart() {
  const { data: session } = useSession();
  const accessToken = (
    session?.user as { accessToken?: string } | undefined
  )?.accessToken;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) =>
    (currentYear - index).toString(),
  );
  const [selectedYear, setSelectedYear] = useState(years[0]);

  const { data: sponsorVisitsResponse } =
    useQuery<MonthlySponsorVisitsResponse>({
      queryKey: ["monthlySponsorVisits", selectedYear, accessToken],
      queryFn: async () => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/dashboard/monthly-sponsor-visits?year=${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Failed to fetch monthly sponsor visits",
          );
        }

        return data;
      },
      enabled: Boolean(accessToken),
    });

  const chartData =
    sponsorVisitsResponse?.data.map((item) => ({
      name: item.month,
      visits: item.count,
    })) ?? [];

  return (
    <Card className="w-full rounded-xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-6">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-bold tracking-tight text-[#1e266e]">
            Sponsor Visits
          </CardTitle>
          <Info className="h-4 w-4 cursor-pointer stroke-[2] text-gray-400" />
        </div>

        <div className="w-[130px]">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 bg-white text-xs font-medium text-gray-600 focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-gray-100 shadow-lg">
              {years.map((year) => (
                <SelectItem
                  key={year}
                  value={year}
                  className="cursor-pointer text-xs font-medium text-gray-600 focus:bg-slate-50 focus:text-[#1e266e]"
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="h-[280px] w-full p-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="sponsorVisitsGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#3b4cb8" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#3b4cb8" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
              dy={15}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11, fontWeight: 500 }}
              domain={[0, "auto"]}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#3b4cb8",
                strokeDasharray: "4 4",
                strokeWidth: 1.5,
              }}
              position={{ y: 25 }}
            />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="#1e266e"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#sponsorVisitsGradient)"
              activeDot={{
                r: 5,
                fill: "#ffffff",
                stroke: "#0066ff",
                strokeWidth: 4,
                className: "shadow-md",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
