"use client";

import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type UserDetails = {
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
  address?: string;
  country?: string;
  postcode?: string;
  state?: string;
};

interface ViewUserProps { isOpen: boolean; onClose: () => void; userId: string }

export default function ViewUser({ isOpen, onClose, userId }: ViewUserProps) {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;
  const { data: response, isPending } = useQuery<{
    success: boolean;
    message: string;
    data: UserDetails;
  }>({
    queryKey: ["managedUser", userId, accessToken],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/${userId}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch user details");
      return data;
    },
    enabled: isOpen && Boolean(accessToken),
  });
  const user = response?.data;
  const statusStyles = user?.status === "active" ? "border-[#22c55e] bg-[#f0fdf4] text-[#22c55e]" : user?.status === "pending" ? "border-[#f59e0b] bg-[#fffbeb] text-[#f59e0b]" : "border-[#ef4444] bg-[#fef2f2] text-[#ef4444]";

  return <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="w-[90%] max-w-[600px] gap-0 rounded-2xl border-0 bg-white p-6 shadow-2xl" overlayClassName="bg-slate-950/35 backdrop-blur-[3px]" showCloseButton={false} data-user-id={userId}>
      <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6"><DialogTitle className="text-xl font-bold text-gray-800">User Details</DialogTitle><button type="button" onClick={onClose} className="cursor-pointer rounded-md p-1 text-gray-700 hover:bg-slate-100" aria-label="Close user details"><X className="h-4 w-4" /></button></DialogHeader>
      {isPending && <div className="py-8 text-center text-sm text-gray-500">Loading user details...</div>}
      {user && <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Detail label="Name" value={[user.firstName, user.lastName].filter(Boolean).join(" ") || "N/A"} /><Detail label="Username" value={user.username || "N/A"} /><Detail label="Email" value={user.email} /><Detail label="Contact" value={user.phoneNumber || "N/A"} /><Detail label="Role" value={user.role === "businessOwner" ? "Business Owner" : user.role} /><Detail label="Gender" value={user.gender || "N/A"} /><Detail label="Tag" value={user.tag || "N/A"} /><div className="flex flex-col gap-2"><span className="text-sm font-semibold text-gray-700">Status</span><div><span className={`inline-block min-w-[85px] rounded-full border px-3 py-1 text-center text-xs font-semibold capitalize ${statusStyles}`}>{user.status}</span></div></div><div className="sm:col-span-2"><Detail label="Address" value={[user.address, user.state, user.postcode, user.country].filter(Boolean).join(", ") || "N/A"} /></div>
      </div>}
    </DialogContent>
  </Dialog>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="flex flex-col gap-1.5"><span className="text-sm font-semibold text-gray-700">{label}</span><span className="break-all text-sm font-medium capitalize text-gray-400">{value}</span></div>;
}
