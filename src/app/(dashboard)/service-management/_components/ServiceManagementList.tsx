"use client";

import React, { useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/pagination/Pagination";
import ViewService from "./ViewService";

const services = [
  {
    id: 1,
    name: "Anderson Electric Co.",
    category: "Electricians",
    location: "Richardson, California 62639",
    contact: "(629) 555-0129",
    hours: "10:00 am–6:00 pm",
    status: "Active",
  },
  {
    id: 2,
    name: "Rivera Plumbing & Drain",
    category: "Plumbers",
    location: "Manchester, Kentucky 39495",
    contact: "(207) 555-0119",
    hours: "10:00 am–6:00 pm",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Sunrise Roofing Inc.",
    category: "Roofers",
    location: "Utica, Pennsylvania 57867",
    contact: "(270) 555-0117",
    hours: "10:00 am–6:00 pm",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Precision Painters LLC",
    category: "Handymen",
    location: "Celina, Delaware 10299",
    contact: "(303) 555-0105",
    hours: "10:00 am–6:00 pm",
    status: "Active",
  },
  {
    id: 5,
    name: "Bright Spark Services",
    category: "Electricians",
    location: "Austin, Texas 73301",
    contact: "(512) 555-0134",
    hours: "9:00 am–5:00 pm",
    status: "Active",
  },
  {
    id: 6,
    name: "Rapid Rooter Co.",
    category: "Plumbers",
    location: "Phoenix, Arizona 85001",
    contact: "(602) 555-0181",
    hours: "8:00 am–6:00 pm",
    status: "Inactive",
  },
  {
    id: 7,
    name: "Elite Roof Solutions",
    category: "Roofers",
    location: "Denver, Colorado 80201",
    contact: "(720) 555-0167",
    hours: "9:00 am–5:30 pm",
    status: "Active",
  },
  {
    id: 8,
    name: "Prime Home Repairs",
    category: "Handymen",
    location: "Portland, Oregon 97035",
    contact: "(503) 555-0192",
    hours: "10:00 am–7:00 pm",
    status: "Active",
  },
  {
    id: 9,
    name: "Metro Electric Works",
    category: "Electricians",
    location: "Chicago, Illinois 60601",
    contact: "(312) 555-0145",
    hours: "9:00 am–6:00 pm",
    status: "Inactive",
  },
  {
    id: 10,
    name: "Clear Flow Plumbing",
    category: "Plumbers",
    location: "Miami, Florida 33101",
    contact: "(305) 555-0176",
    hours: "8:30 am–5:30 pm",
    status: "Active",
  },
  {
    id: 11,
    name: "Skyline Roofing Group",
    category: "Roofers",
    location: "Seattle, Washington 98101",
    contact: "(206) 555-0158",
    hours: "9:00 am–6:00 pm",
    status: "Active",
  },
  {
    id: 12,
    name: "Reliable Handyman LLC",
    category: "Handymen",
    location: "Boston, Massachusetts 02108",
    contact: "(617) 555-0114",
    hours: "10:00 am–6:00 pm",
    status: "Inactive",
  },
];

export default function ServiceManagementList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null,
  );
  const limit = 5;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      !normalizedQuery ||
      service.name.toLowerCase().includes(normalizedQuery) ||
      service.category.toLowerCase().includes(normalizedQuery) ||
      service.location.toLowerCase().includes(normalizedQuery);
    const matchesStatus =
      statusFilter === "all" || service.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedServices = filteredServices.slice(
    (page - 1) * limit,
    page * limit,
  );
  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const getStatusStyles = (status: string) =>
    status === "Active"
      ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]"
      : "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]";

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search service, category, location..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 rounded-lg border-gray-200 bg-white pl-9 text-sm focus-visible:border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="w-full sm:w-[150px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 !w-full rounded-lg border-gray-200 bg-white text-sm font-medium text-gray-600 focus:border-gray-300 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 shadow-lg">
                <SelectItem
                  value="all"
                  className="cursor-pointer text-sm text-gray-600"
                >
                  Status
                </SelectItem>
                <SelectItem
                  value="active"
                  className="cursor-pointer text-sm text-gray-600"
                >
                  Active
                </SelectItem>
                <SelectItem
                  value="inactive"
                  className="cursor-pointer text-sm text-gray-600"
                >
                  Inactive
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">
                  Service Provider Name
                </th>
                <th className="px-4 py-3.5 text-center">Category</th>
                <th className="px-4 py-3.5 text-center">Location</th>
                <th className="px-4 py-3.5 text-center">Contact</th>
                <th className="px-4 py-3.5 text-center">Service Hours</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="rounded-tr-xl py-3.5 pl-14 pr-6 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {paginatedServices.map((service) => (
                <tr
                  key={service.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">
                    {service.name}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#3b4cb8]">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-gray-700">
                    {service.location}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-gray-700">
                    {service.contact}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-700">
                    {service.hours}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block min-w-[85px] rounded-full border px-3 py-1 text-center text-xs font-semibold ${getStatusStyles(service.status)}`}
                    >
                      {service.status}
                    </span>
                  </td>
                  <td className="py-4 pl-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="h-7 cursor-pointer rounded-md bg-[#dc2626] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedServiceId(service.id)}
                        aria-label={`View ${service.name}`}
                        className="ml-1 cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] shadow-sm transition-colors hover:border-[#2b3674] hover:bg-[#eef2ff]"
                      >
                        <Eye className="h-4 w-4 stroke-[2]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={limit}
          total={filteredServices.length}
          currentCount={paginatedServices.length}
          onPageChange={setPage}
        />
      </div>

      {selectedService && (
        <ViewService
          isOpen={selectedServiceId !== null}
          onClose={() => setSelectedServiceId(null)}
          serviceId={selectedService.id}
          serviceData={selectedService}
        />
      )}
    </>
  );
}
