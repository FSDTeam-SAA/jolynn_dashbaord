"use client";

import React, { useDeferredValue, useEffect, useState } from "react";
import { Eye, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/pagination/Pagination";
import ViewJob from "./ViewJob";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type JobPost = {
  _id: string;
  userId?: string;
  username: string;
  email: string;
  zipcode: string;
  category: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type JobListResponse = {
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: JobPost[];
};

export default function JobList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobPost | null>(null);
  const deferredSearch = useDeferredValue(searchQuery.trim());
  const limit = 10;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  const { data: response } = useQuery<JobListResponse>({
    queryKey: ["helpWantedJobs", page, deferredSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit), page: String(page) });
      if (deferredSearch) params.set("searchTerm", deferredSearch);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/help-wanted?${params}`);
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch jobs");
      return data;
    },
  });
  const jobs = response?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/help-wanted/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to delete job");
      return data;
    },
    onSuccess: (data) => { toast.success(data?.message || "Job deleted successfully"); setJobToDelete(null); queryClient.invalidateQueries({ queryKey: ["helpWantedJobs"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => setPage(1), [searchQuery]);

  return <>
    <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
      <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><Input type="text" placeholder="Search username, email, category..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="h-10 rounded-lg border-gray-200 bg-white pl-9 text-sm focus-visible:ring-0" /></div>
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[1100px] border-collapse text-left"><thead><tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white"><th className="rounded-tl-xl py-3.5 pl-6 pr-4">Username</th><th className="px-4 py-3.5 text-center">Email</th><th className="px-4 py-3.5 text-center">Category</th><th className="px-4 py-3.5 text-center">Zip Code</th><th className="px-4 py-3.5 text-center">Contact</th><th className="px-4 py-3.5 text-center">Requirement</th><th className="rounded-tr-xl py-3.5 pl-8 text-center">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {jobs.map((job) => <tr key={job._id} className="hover:bg-slate-50/50"><td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">{job.username}</td><td className="px-4 py-4 text-center text-gray-700">{job.email}</td><td className="px-4 py-4 text-center"><span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-medium text-[#3b4cb8]">{job.category}</span></td><td className="px-4 py-4 text-center font-medium text-gray-700">{job.zipcode}</td><td className="px-4 py-4 text-center text-gray-700">{job.phone}</td><td className="max-w-[220px] px-4 py-4 text-center text-gray-600"><p className="truncate">{job.message}</p></td><td className="py-4 pl-4 pr-6"><div className="flex items-center justify-end gap-2"><button onClick={() => setSelectedJobId(job._id)} aria-label={`View job from ${job.username}`} className="cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:bg-[#eef2ff]"><Eye className="h-4 w-4" /></button><button onClick={() => setJobToDelete(job)} aria-label={`Delete job from ${job.username}`} className="cursor-pointer rounded-md border border-red-200 p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
            {!jobs.length && <tr><td colSpan={7} className="py-8 text-center text-sm text-gray-500">No jobs found</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} limit={limit} total={response?.meta.total ?? 0} currentCount={jobs.length} onPageChange={setPage} />
    </div>
    {selectedJobId && <ViewJob isOpen onClose={() => setSelectedJobId(null)} jobId={selectedJobId} />}
    <DeleteModal isOpen={!!jobToDelete} onClose={() => !deleteMutation.isPending && setJobToDelete(null)} onConfirm={() => jobToDelete && deleteMutation.mutate(jobToDelete._id)} itemName={jobToDelete ? `${jobToDelete.username}'s job` : "this job"} isDeleting={deleteMutation.isPending} />
  </>;
}
