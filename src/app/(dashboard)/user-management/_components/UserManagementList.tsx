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
import ViewUser from "./ViewUser";

const users = [
  {
    id: 1,
    username: "Eduardo_12",
    email: "alma.lawson@example.com",
    contact: "(629) 555-0129",
    status: "Active",
  },
  {
    id: 2,
    username: "Dianne_22",
    email: "georgia.young@example.com",
    contact: "(207) 555-0119",
    status: "Inactive",
  },
  {
    id: 3,
    username: "Kyle_87",
    email: "nevaeh.simmons@example.com",
    contact: "(270) 555-0117",
    status: "Inactive",
  },
  {
    id: 4,
    username: "Cameron_32",
    email: "deanna.curtis@example.com",
    contact: "(303) 555-0105",
    status: "Active",
  },
  {
    id: 5,
    username: "Brooklyn_18",
    email: "brooklyn.simmons@example.com",
    contact: "(406) 555-0120",
    status: "Active",
  },
  {
    id: 6,
    username: "Leslie_44",
    email: "leslie.alexander@example.com",
    contact: "(319) 555-0148",
    status: "Inactive",
  },
  {
    id: 7,
    username: "Jenny_09",
    email: "jenny.wilson@example.com",
    contact: "(480) 555-0136",
    status: "Active",
  },
  {
    id: 8,
    username: "Robert_51",
    email: "robert.fox@example.com",
    contact: "(505) 555-0174",
    status: "Active",
  },
  {
    id: 9,
    username: "Wade_73",
    email: "wade.warren@example.com",
    contact: "(615) 555-0193",
    status: "Inactive",
  },
  {
    id: 10,
    username: "Esther_26",
    email: "esther.howard@example.com",
    contact: "(702) 555-0151",
    status: "Active",
  },
  {
    id: 11,
    username: "Jacob_65",
    email: "jacob.jones@example.com",
    contact: "(808) 555-0165",
    status: "Inactive",
  },
  {
    id: 12,
    username: "Jane_38",
    email: "jane.cooper@example.com",
    contact: "(917) 555-0182",
    status: "Active",
  },
];

export default function UserManagementList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const limit = 5;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !normalizedQuery ||
      user.username.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery) ||
      user.contact.toLowerCase().includes(normalizedQuery);
    const matchesStatus =
      statusFilter === "all" || user.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);
  const selectedUser = users.find((user) => user.id === selectedUserId);

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
              placeholder="Search username, email, contact..."
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
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Username</th>
                <th className="px-4 py-3.5 text-center">Email</th>
                <th className="px-4 py-3.5 text-center">Contact</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="rounded-tr-xl py-3.5  text-end pr-16">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">
                    {user.username}
                  </td>
                  <td className="px-4 py-4 text-center text-gray-700">
                    {user.email}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-gray-700">
                    {user.contact}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`inline-block min-w-[85px] rounded-full border px-3 py-1 text-center text-xs font-semibold ${getStatusStyles(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 pl-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        className="h-7 cursor-pointer rounded-md bg-[#dc2626] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
                      >
                        Suspend
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedUserId(user.id)}
                        aria-label={`View ${user.username}`}
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
          total={filteredUsers.length}
          currentCount={paginatedUsers.length}
          onPageChange={setPage}
        />
      </div>

      {selectedUser && (
        <ViewUser
          isOpen={selectedUserId !== null}
          onClose={() => setSelectedUserId(null)}
          userId={selectedUser.id}
          userData={selectedUser}
        />
      )}
    </>
  );
}
