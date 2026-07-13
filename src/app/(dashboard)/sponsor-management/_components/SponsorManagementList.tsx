"use client";

import React, { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/pagination/Pagination";
import ViewSponsor from "./ViewSponsor";

interface Sponsor {
  id: number;
  title: string;
  content: string;
  image: string;
  status: "Active" | "Inactive";
}

const description =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const initialSponsors: Sponsor[] = [
  {
    id: 1,
    title: "Anderson Electric Co.",
    content: `<p>${description}</p>`,
    image: "",
    status: "Active",
  },
  {
    id: 2,
    title: "Rivera Plumbing & Drain",
    content: `<p>${description}</p>`,
    image: "",
    status: "Inactive",
  },
  {
    id: 3,
    title: "Sunrise Roofing Inc.",
    content: `<p>${description}</p>`,
    image: "",
    status: "Inactive",
  },
  {
    id: 4,
    title: "Precision Painters LLC",
    content: `<p>${description}</p>`,
    image: "",
    status: "Active",
  },
  {
    id: 5,
    title: "Bright Spark Services",
    content: `<p>${description}</p>`,
    image: "",
    status: "Active",
  },
  {
    id: 6,
    title: "Rapid Rooter Co.",
    content: `<p>${description}</p>`,
    image: "",
    status: "Inactive",
  },
  {
    id: 7,
    title: "Elite Roof Solutions",
    content: `<p>${description}</p>`,
    image: "",
    status: "Active",
  },
  {
    id: 8,
    title: "Prime Home Repairs",
    content: `<p>${description}</p>`,
    image: "",
    status: "Active",
  },
  {
    id: 9,
    title: "Metro Electric Works",
    content: `<p>${description}</p>`,
    image: "",
    status: "Inactive",
  },
  {
    id: 10,
    title: "Clear Flow Plumbing",
    content: `<p>${description}</p>`,
    image: "",
    status: "Active",
  },
  {
    id: 11,
    title: "Skyline Roofing Group",
    content: `<p>${description}</p>`,
    image: "",
    status: "Active",
  },
  {
    id: 12,
    title: "Reliable Handyman LLC",
    content: `<p>${description}</p>`,
    image: "",
    status: "Inactive",
  },
];

export default function SponsorManagementList() {
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [viewSponsorId, setViewSponsorId] = useState<number | null>(null);
  const limit = 5;

  const filteredSponsors = sponsors.filter(
    (sponsor) =>
      statusFilter === "all" || sponsor.status.toLowerCase() === statusFilter,
  );
  const paginatedSponsors = filteredSponsors.slice(
    (page - 1) * limit,
    page * limit,
  );
  const selectedViewSponsor = sponsors.find(
    (sponsor) => sponsor.id === viewSponsorId,
  );

  useEffect(() => setPage(1), [statusFilter]);

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
        <div className="flex flex-col justify-end gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[175px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="!h-10 !w-full rounded-[8px] border-gray-200 bg-white text-sm font-medium text-gray-600 shadow-sm focus:ring-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-100 shadow-lg">
                <SelectItem value="all">Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Link
            href="/sponsor-management/add"
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#2b3674] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#20285f]"
          >
            <Plus className="h-4 w-4" /> Add Sponsor
          </Link>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Sponsor Name</th>
                <th className="px-4 py-3.5 text-center">Content</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="rounded-tr-xl py-3.5 pl-16 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {paginatedSponsors.map((sponsor) => (
                <tr
                  key={sponsor.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">
                    {sponsor.title}
                  </td>
                  <td className="max-w-[500px] px-4 py-4 text-center text-gray-600">
                    <div
                      className="line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: sponsor.content }}
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block min-w-[85px] rounded-full border px-3 py-1 text-xs font-semibold ${sponsor.status === "Active" ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]" : "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]"}`}
                    >
                      {sponsor.status}
                    </span>
                  </td>
                  <td className="py-4 pl-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/sponsor-management/edit/${sponsor.id}`}
                        aria-label={`Edit ${sponsor.title}`}
                        className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:border-[#2b3674] hover:bg-[#eef2ff]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setViewSponsorId(sponsor.id)}
                        aria-label={`View ${sponsor.title}`}
                        className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:border-[#2b3674] hover:bg-[#eef2ff]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSponsors((current) =>
                            current.filter((item) => item.id !== sponsor.id),
                          )
                        }
                        aria-label={`Delete ${sponsor.title}`}
                        className="rounded-md border border-red-200 p-1.5 text-red-600 transition-colors hover:border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
          total={filteredSponsors.length}
          currentCount={paginatedSponsors.length}
          onPageChange={setPage}
        />
      </div>

      {selectedViewSponsor && (
        <ViewSponsor
          isOpen={viewSponsorId !== null}
          onClose={() => setViewSponsorId(null)}
          sponsorId={selectedViewSponsor.id}
          sponsor={selectedViewSponsor}
        />
      )}
    </>
  );
}
