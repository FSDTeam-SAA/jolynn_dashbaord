"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/app/(dashboard)/sponsor-management/_components/RichTextEditor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { Faq } from "./FAQList";

interface EditFaqProps {
  faqId: string;
}

export default function EditFaq({ faqId }: EditFaqProps) {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  const { data: response } = useQuery<{ success: boolean; message: string; data: Faq }>({
    queryKey: ["faq", faqId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/faq/${faqId}`);
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch FAQ");
      return data;
    },
  });

  useEffect(() => {
    if (response?.data) { setQuestion(response.data.question); setAnswer(response.data.answer); }
  }, [response]);

  const updateMutation = useMutation({
    mutationFn: async (body: { question: string; answer: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/faq/${faqId}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to update FAQ");
      return data;
    },
    onSuccess: (data) => { toast.success(data?.message || "FAQ updated successfully"); router.push("/faq-management"); },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) return toast.error("Question and answer are required");
    updateMutation.mutate({ question: question.trim(), answer });
  };

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" data-faq-id={faqId}>
      <div className="flex items-center justify-between pb-5">
        <h2 className="text-xl font-bold text-gray-800">Edit FAQ</h2>
        <button type="button" onClick={() => router.push("/faq-management")} aria-label="Close" className="rounded-md p-1 text-gray-700 hover:bg-slate-100"><X className="h-4 w-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="edit-faq-question" className="text-sm font-medium text-gray-700">Question</label>
          <Input id="edit-faq-question" value={question} onChange={(event) => setQuestion(event.target.value)} className="h-11" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Answer</label>
          <RichTextEditor value={answer} onChange={setAnswer} placeholder="Write the FAQ answer..." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => router.push("/faq-management")} className="h-11 rounded-md bg-gray-200 text-sm font-semibold text-[#2b3674] hover:bg-gray-300">Cancel</button>
          <button type="submit" disabled={updateMutation.isPending} className="h-11 rounded-md bg-[#2b3674] text-sm font-semibold text-white hover:bg-[#20285f] disabled:opacity-60">{updateMutation.isPending ? "Saving..." : "Save FAQ"}</button>
        </div>
      </form>
    </div>
  );
}
