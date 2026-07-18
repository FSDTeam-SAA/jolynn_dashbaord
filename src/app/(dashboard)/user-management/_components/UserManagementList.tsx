"use client";

import React, { useDeferredValue, useEffect, useState } from "react";
import { Eye, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Pagination from "@/components/pagination/Pagination";
import ViewUser from "./ViewUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type ManagedUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  username?: string;
  role: string;
  gender?: string;
  phoneNumber?: string;
  status: string;
  tag?: string;
  profilePicture?: string;
  address?: string;
  country?: string;
  postcode?: string;
  state?: string;
  createdAt: string;
  updatedAt: string;
};

type UserListResponse = { success: boolean; message: string; meta: { page: number; limit: number; total: number }; data: ManagedUser[] };

export default function UserManagementList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(searchQuery.trim());
  const limit = 10;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  const { data: response } = useQuery<UserListResponse>({
    queryKey: ["managedUsers", page, roleFilter, deferredSearch, accessToken],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), page: String(page) });
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (deferredSearch) params.set("searchTerm", deferredSearch);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user?${params}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch users");
      return data;
    },
    enabled: Boolean(accessToken),
  });
  const users = response?.data ?? [];

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ status }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to update user status");
      return data;
    },
    onSuccess: (data) => { toast.success(data?.message || "User status updated"); queryClient.invalidateQueries({ queryKey: ["managedUsers"] }); queryClient.invalidateQueries({ queryKey: ["managedUser"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => setPage(1), [searchQuery, roleFilter]);

  const getStatusStyles = (status: string) => {
    if (status === "active") return "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]";
    if (status === "pending") return "border-[#f59e0b] bg-[#fffbeb] text-[#f59e0b]";
    return "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]";
  };

  return <>
    <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input type="text" placeholder="Search username, email, contact..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 rounded-lg border-gray-200 bg-white pl-9 text-sm focus-visible:ring-0" /></div>
        <div className="w-full sm:w-[170px]"><Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="h-10 !w-full rounded-lg border-gray-200 bg-white text-sm font-medium text-gray-600 focus:ring-0"><SelectValue placeholder="Role" /></SelectTrigger><SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="admin">Admin</SelectItem><SelectItem value="user">User</SelectItem><SelectItem value="businessOwner">Business Owner</SelectItem></SelectContent></Select></div>
      </div>
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[900px] border-collapse text-left"><thead><tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white"><th className="rounded-tl-xl py-3.5 pl-6 pr-4">Username</th><th className="px-4 py-3.5 text-center">Email</th><th className="px-4 py-3.5 text-center">Contact</th><th className="px-4 py-3.5 text-center">Role</th><th className="px-4 py-3.5 text-center">Status</th><th className="rounded-tr-xl py-3.5 pr-6 text-end">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {users.map((user) => { const suspended = user.status.toLowerCase() === "suspended"; return <tr key={user._id} className="hover:bg-slate-50/50"><td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">{user.username || [user.firstName, user.lastName].filter(Boolean).join(" ") || "N/A"}</td><td className="px-4 py-4 text-center text-gray-700">{user.email}</td><td className="px-4 py-4 text-center font-medium text-gray-700">{user.phoneNumber || "N/A"}</td><td className="px-4 py-4 text-center capitalize text-gray-700">{user.role === "businessOwner" ? "Business Owner" : user.role}</td><td className="px-4 py-4 text-center"><span className={`inline-block min-w-[85px] rounded-full border px-3 py-1 text-center text-xs font-semibold capitalize ${getStatusStyles(user.status.toLowerCase())}`}>{user.status}</span></td><td className="py-4 pl-4 pr-6"><div className="flex items-center justify-end gap-2"><button disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: user._id, status: suspended ? "active" : "suspended" })} className={`h-7 cursor-pointer rounded-md px-3 text-xs font-semibold text-white shadow-sm disabled:opacity-60 ${suspended ? "bg-[#22c55e] hover:bg-green-600" : "bg-[#dc2626] hover:bg-red-600"}`}>{suspended ? "Activate" : "Suspend"}</button><button onClick={() => setSelectedUserId(user._id)} aria-label={`View ${user.username || user.email}`} className="cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:bg-[#eef2ff]"><Eye className="h-4 w-4" /></button></div></td></tr>; })}
            {!users.length && <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-500">No users found</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} limit={limit} total={response?.meta.total ?? 0} currentCount={users.length} onPageChange={setPage} />
    </div>
    {selectedUserId && <ViewUser isOpen onClose={() => setSelectedUserId(null)} userId={selectedUserId} />}
  </>;
}
