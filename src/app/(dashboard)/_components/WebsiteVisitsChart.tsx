// eslint-disable-next-line @typescript-eslint/no-explicit-any
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const data = [
  { name: "Jan", visits: 40 },
  { name: "Feb", visits: 180 },
  { name: "Mar", visits: 160 },
  { name: "Apr", visits: 100 },
  { name: "May", visits: 280 },
  { name: "June", visits: 460 },
  { name: "July", visits: 520 },
  { name: "Aug", visits: 380 },
  { name: "Sep", visits: 640 },
  { name: "Oct", visits: 440 },
  { name: "Nov", visits: 240 },
  { name: "Dec", visits: 300 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-xl flex flex-col gap-0.5 min-w-[120px]">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          This Month
        </span>
        <span className="text-base font-bold text-gray-900">
          {payload[0].value} Users
        </span>
        <span className="text-[11px] font-medium text-gray-400">
          {payload[0].payload.name}
        </span>
      </div>
    );
  }
  return null;
};

export default function WebsiteVisitsChart() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, index) =>
    (currentYear - index).toString(),
  );

  const [selectedYear, setSelectedYear] = useState<string>(years[0]);

  return (
    <Card className="w-full bg-white rounded-xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 mt-10">
      {/* Header Section */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-6">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-bold text-[#1e266e] tracking-tight">
            Website Visits
          </CardTitle>
          <Info className="w-4 h-4 text-gray-400 cursor-pointer stroke-[2]" />
        </div>

        {/* Dynamic shadcn Select Dropdown */}
        <div className="w-[130px]">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-9 text-xs font-medium text-gray-600 border-gray-200 focus:ring-0 focus:ring-offset-0 focus:border-gray-300 rounded-lg bg-white">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-gray-100 shadow-lg">
              {years.map((year) => (
                <SelectItem
                  key={year}
                  value={year}
                  className="text-xs font-medium text-gray-600 focus:bg-slate-50 focus:text-[#1e266e] cursor-pointer"
                >
                  June, {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {/* Chart Canvas Section */}
      <CardContent className="p-0 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b4cb8" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#3b4cb8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#f3f4f6"
              strokeDasharray="0"
            />

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
              domain={[0, 750]}
              ticks={[0, 250, 500, 750]}
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
              fill="url(#chartGradient)"
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
