"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import ViewFaq from "./ViewFaq";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export type Faq = {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
};

type FaqListResponse = {
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: Faq[];
};

export default function FAQList() {
  const [page, setPage] = useState(1);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);
  const [faqToDelete, setFaqToDelete] = useState<Faq | null>(null);
  const limit = 10;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  const { data: response } = useQuery<FaqListResponse>({
    queryKey: ["faqs", page],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/faq?limit=${limit}&page=${page}`);
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch FAQs");
      return data;
    },
  });
  const faqs = response?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/faq/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to delete FAQ");
      return data;
    },
    onSuccess: (data) => { toast.success(data?.message || "FAQ deleted successfully"); setFaqToDelete(null); queryClient.invalidateQueries({ queryKey: ["faqs"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  return <>
    <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
      <div className="flex justify-end"><Link href="/faq-management/add" className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#2b3674] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#20285f]"><Plus className="h-4 w-4" /> Add FAQ</Link></div>
      <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full min-w-[760px] border-collapse text-left"><thead><tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white"><th className="rounded-tl-xl py-3.5 pl-6 pr-4">Question</th><th className="px-4 py-3.5 text-center">Answer</th><th className="rounded-tr-xl py-3.5 pl-4 pr-6 text-center">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-100 bg-white text-sm">
            {faqs.map((faq) => <tr key={faq._id} className="hover:bg-slate-50/50"><td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">{faq.question}</td><td className="max-w-[520px] px-4 py-4 text-center text-gray-600"><div className="line-clamp-2" dangerouslySetInnerHTML={{ __html: faq.answer }} /></td><td className="py-4 pl-4 pr-6"><div className="flex items-center justify-end gap-2"><Link href={`/faq-management/edit/${faq._id}`} aria-label={`Edit ${faq.question}`} className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:bg-[#eef2ff]"><Pencil className="h-4 w-4" /></Link><button onClick={() => setSelectedFaqId(faq._id)} aria-label={`View ${faq.question}`} className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:bg-[#eef2ff]"><Eye className="h-4 w-4" /></button><button onClick={() => setFaqToDelete(faq)} aria-label={`Delete ${faq.question}`} className="rounded-md border border-red-200 p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
            {!faqs.length && <tr><td colSpan={3} className="py-8 text-center text-sm text-gray-500">No FAQs found</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={page} limit={limit} total={response?.meta.total ?? 0} currentCount={faqs.length} onPageChange={setPage} />
    </div>
    {selectedFaqId && <ViewFaq isOpen onClose={() => setSelectedFaqId(null)} faqId={selectedFaqId} />}
    <DeleteModal isOpen={!!faqToDelete} onClose={() => !deleteMutation.isPending && setFaqToDelete(null)} onConfirm={() => faqToDelete && deleteMutation.mutate(faqToDelete._id)} itemName={faqToDelete?.question || "this FAQ"} isDeleting={deleteMutation.isPending} />
  </>;
}
