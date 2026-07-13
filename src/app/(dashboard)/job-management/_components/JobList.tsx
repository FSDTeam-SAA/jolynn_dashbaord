"use client";

import React, { useEffect, useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagination/Pagination";
import ViewJob from "./ViewJob";

export interface JobPost {
  id: number;
  username: string;
  email: string;
  category: string;
  zipCode: string;
  contact: string;
  requirement: string;
}

const detailedRequirement =
  "Looking for a Dog Poop Picking Service 🐶\n\nHi everyone! I’m looking for a reliable pet waste removal service to clean up my yard on a regular basis. If you provide this service or know someone who does, please leave a comment or send me a message with your pricing and availability.\n\nThanks in advance!";

const initialJobs: JobPost[] = [
  {
    id: 1,
    username: "Eduardo_12",
    email: "alma.lawson@example.com",
    category: "Poop Picking",
    zipCode: "0129",
    contact: "(629) 555-0129",
    requirement: detailedRequirement,
  },
  {
    id: 2,
    username: "Dianne_22",
    email: "georgia.young@example.com",
    category: "Plumbers",
    zipCode: "0119",
    contact: "(207) 555-0119",
    requirement:
      "Looking for an experienced plumber to repair a leaking kitchen pipe and inspect the water line.",
  },
  {
    id: 3,
    username: "Kyle_87",
    email: "nevaeh.simmons@example.com",
    category: "Roofers",
    zipCode: "0117",
    contact: "(270) 555-0117",
    requirement:
      "Need a roofing professional to inspect storm damage and provide a repair estimate.",
  },
  {
    id: 4,
    username: "Cameron_32",
    email: "deanna.curtis@example.com",
    category: "Handyman",
    zipCode: "0105",
    contact: "(303) 555-0105",
    requirement:
      "Looking for a handyman for several small home repairs and furniture installation.",
  },
  {
    id: 5,
    username: "Brooklyn_18",
    email: "brooklyn.simmons@example.com",
    category: "Electricians",
    zipCode: "0120",
    contact: "(406) 555-0120",
    requirement:
      "Need an electrician to install new lighting fixtures and check two power outlets.",
  },
  {
    id: 6,
    username: "Leslie_44",
    email: "leslie.alexander@example.com",
    category: "Painters",
    zipCode: "0148",
    contact: "(319) 555-0148",
    requirement: "Looking for an interior painter for a two-bedroom apartment.",
  },
  {
    id: 7,
    username: "Jenny_09",
    email: "jenny.wilson@example.com",
    category: "Cleaners",
    zipCode: "0136",
    contact: "(480) 555-0136",
    requirement: "Weekly home cleaning service needed for a family residence.",
  },
  {
    id: 8,
    username: "Robert_51",
    email: "robert.fox@example.com",
    category: "Gardeners",
    zipCode: "0174",
    contact: "(505) 555-0174",
    requirement:
      "Need lawn mowing, hedge trimming, and seasonal garden maintenance.",
  },
  {
    id: 9,
    username: "Wade_73",
    email: "wade.warren@example.com",
    category: "Carpenters",
    zipCode: "0193",
    contact: "(615) 555-0193",
    requirement: "Looking for custom shelving and cabinet repair services.",
  },
  {
    id: 10,
    username: "Esther_26",
    email: "esther.howard@example.com",
    category: "Movers",
    zipCode: "0151",
    contact: "(702) 555-0151",
    requirement: "Need help moving furniture to a new apartment across town.",
  },
  {
    id: 11,
    username: "Jacob_65",
    email: "jacob.jones@example.com",
    category: "Mechanics",
    zipCode: "0165",
    contact: "(808) 555-0165",
    requirement:
      "Seeking a mobile mechanic for a vehicle inspection and battery replacement.",
  },
  {
    id: 12,
    username: "Jane_38",
    email: "jane.cooper@example.com",
    category: "Locksmiths",
    zipCode: "0182",
    contact: "(917) 555-0182",
    requirement:
      "Need a locksmith to replace the front door lock and provide spare keys.",
  },
];

export default function JobList() {
  const [jobs, setJobs] = useState(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const limit = 5;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredJobs = jobs.filter(
    (job) =>
      !normalizedQuery ||
      job.username.toLowerCase().includes(normalizedQuery) ||
      job.email.toLowerCase().includes(normalizedQuery) ||
      job.category.toLowerCase().includes(normalizedQuery),
  );
  const paginatedJobs = filteredJobs.slice((page - 1) * limit, page * limit);
  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search username, email, category..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="h-10 rounded-lg border-gray-200 bg-white pl-9 text-sm focus-visible:border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Username</th>
                <th className="px-4 py-3.5 text-center">Email</th>
                <th className="px-4 py-3.5 text-center">Category</th>
                <th className="px-4 py-3.5 text-center">Zip Code</th>
                <th className="px-4 py-3.5 text-center">Contact</th>
                <th className="px-4 py-3.5 text-center">Requirement</th>
                <th className="rounded-tr-xl py-3.5 pl-8 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {paginatedJobs.map((job) => (
                <tr
                  key={job.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">
                    {job.username}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-700">
                    {job.email}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#3b4cb8]">
                      {job.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-gray-700">
                    {job.zipCode}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-700">
                    {job.contact}
                  </td>
                  <td className="max-w-[220px] px-4 py-4 text-center text-gray-600">
                    <p className="truncate">{job.requirement}</p>
                  </td>
                  <td className="py-4 pl-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedJobId(job.id)}
                        aria-label={`View job from ${job.username}`}
                        className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:border-[#2b3674] hover:bg-[#eef2ff]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setJobs((current) =>
                            current.filter((item) => item.id !== job.id),
                          )
                        }
                        aria-label={`Delete job from ${job.username}`}
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
          total={filteredJobs.length}
          currentCount={paginatedJobs.length}
          onPageChange={setPage}
        />
      </div>

      {selectedJob && (
        <ViewJob
          isOpen={selectedJobId !== null}
          onClose={() => setSelectedJobId(null)}
          jobId={selectedJob.id}
          job={selectedJob}
        />
      )}
    </>
  );
}
