"use client";

import React, { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/pagination/Pagination";
import ViewBusiness from "./ViewBusiness";

export default function BusinessManagementList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(
    null,
  );
  const limit = 10;

  // Mock Data matching your image precisely
  const businesses = [
    {
      id: 1,
      name: "Anderson Electric Co.",
      category: "Electricians",
      owner: "James Anderson",
      status: "Active",
      isLink: true,
    },
    {
      id: 2,
      name: "Rivera Plumbing & Drain",
      category: "Plumbers",
      owner: "Carlos Rivera",
      status: "Pending",
      isLink: true,
    },
    {
      id: 3,
      name: "Sunrise Roofing Inc.",
      category: "Roofers",
      owner: "Tommy Nguyen",
      status: "Rejected",
      isLink: true,
    },
    {
      id: 4,
      name: "Precision Painters LLC",
      category: "Handymen",
      owner: "Mike Kowalski",
      status: "Active",
      isLink: false,
    },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch =
      !normalizedQuery ||
      business.name.toLowerCase().includes(normalizedQuery) ||
      business.owner.toLowerCase().includes(normalizedQuery);
    const matchesStatus =
      statusFilter === "all" || business.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedBusinesses = filteredBusinesses.slice(
    (page - 1) * limit,
    page * limit,
  );

  const selectedBusiness = businesses.find(
    (business) => business.id === selectedBusinessId,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  // Status Badge color mapping
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Active":
        return "border-[#22c55e] text-[#22c55e] bg-[#f0fdf4]";
      case "Pending":
        return "border-[#f59e0b] text-[#f59e0b] bg-[#fffbeb]";
      case "Rejected":
        return "border-[#ef4444] text-[#ef4444] bg-[#fef2f2]";
      default:
        return "border-gray-200 text-gray-500 bg-gray-50";
    }
  };

  return (
    <>
      <div className="w-full rounded-xl border border-gray-100 flex flex-col gap-6">
      {/* Top Header Controls: Replaced Title with Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Field (Title এর জায়গায় বসেছে) */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search business name, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-gray-300 rounded-lg text-sm bg-white"
          />
        </div>

        {/* Right Side Status Dropdown */}
        <div className="w-full sm:w-[150px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10  !w-full text-sm font-medium text-gray-600 border-gray-200 focus:ring-0 focus:ring-offset-0 focus:border-gray-300 rounded-lg bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-gray-100 shadow-lg">
              <SelectItem
                value="all"
                className="text-sm cursor-pointer text-gray-600"
              >
                Status
              </SelectItem>
              <SelectItem
                value="active"
                className="text-sm cursor-pointer text-gray-600"
              >
                Active
              </SelectItem>
              <SelectItem
                value="pending"
                className="text-sm cursor-pointer text-gray-600"
              >
                Pending
              </SelectItem>
              <SelectItem
                value="rejected"
                className="text-sm cursor-pointer text-gray-600"
              >
                Rejected
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Responsive Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-left border-collapse min-w-[800px]">
          {/* Dark Navy Table Header */}
          <thead>
            <tr className="bg-[#2b3674] text-white text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3.5 pl-6 pr-4 rounded-tl-xl">Business Name</th>
              <th className="py-3.5 px-4 text-center">Category</th>
              <th className="py-3.5 px-4 text-center">Owner</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 pl-4 pr-25 text-right rounded-tr-xl">Action</th>
            </tr>
          </thead>

          {/* Table Body rows */}
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {paginatedBusinesses.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                {/* Business Name Column */}
                <td className="py-4 pl-6 pr-4 font-semibold">
                  {row.isLink ? (
                    <span className="text-[#3b4cb8] cursor-pointer hover:underline">
                      {row.name}
                    </span>
                  ) : (
                    <span className="text-gray-800">{row.name}</span>
                  )}
                </td>

                {/* Category Badge Column */}
                <td className="py-4 px-4 text-center">
                  <span className="px-2.5 py-1 text-xs font-medium bg-[#eef2ff] text-[#3b4cb8] rounded-md">
                    {row.category}
                  </span>
                </td>

                {/* Owner Column */}
                <td className="py-4 px-4 text-center text-gray-700 font-medium">
                  {row.owner}
                </td>

                {/* Status Column */}
                <td className="py-4 px-4 text-center">
                  <span
                    className={`inline-block min-w-[85px] px-3 py-1 text-xs font-semibold rounded-full border text-center ${getStatusStyles(row.status)}`}
                  >
                    {row.status}
                  </span>
                </td>

                {/* Action Buttons Column */}
                <td className="py-4 pl-4 pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <button className="h-7 cursor-pointer px-3 text-xs font-semibold text-white bg-[#22c55e] hover:bg-green-600 rounded-md transition-colors shadow-sm">
                      Approve
                    </button>
                    <button className="h-7 cursor-pointer px-3 text-xs font-semibold text-white bg-[#dc2626] hover:bg-red-600 rounded-md transition-colors shadow-sm">
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedBusinessId(row.id)}
                      aria-label={`View ${row.name}`}
                      className="ml-1 cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] shadow-sm transition-colors hover:border-[#2b3674] hover:bg-[#eef2ff]"
                    >
                      <Eye className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Part */}
      <Pagination
        page={page}
        limit={limit}
        total={filteredBusinesses.length}
        currentCount={paginatedBusinesses.length}
        onPageChange={setPage}
      />
      </div>

      {selectedBusiness && (
        <ViewBusiness
          isOpen={selectedBusinessId !== null}
          onClose={() => setSelectedBusinessId(null)}
          businessId={selectedBusiness.id}
          businessData={selectedBusiness}
        />
      )}
    </>
  );
}
