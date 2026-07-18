"use client";

import React, { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/app/(dashboard)/sponsor-management/_components/RichTextEditor";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function AddFaq() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  const createMutation = useMutation({
    mutationFn: async (body: { question: string; answer: string }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/faq`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to add FAQ");
      return data;
    },
    onSuccess: (data) => { toast.success(data?.message || "FAQ added successfully"); router.push("/faq-management"); },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) return toast.error("Question and answer are required");
    createMutation.mutate({ question: question.trim(), answer });
  };

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5">
        <h2 className="text-xl font-bold text-gray-800">Add New FAQ</h2>
        <button type="button" onClick={() => router.push("/faq-management")} aria-label="Close" className="rounded-md p-1 text-gray-700 hover:bg-slate-100"><X className="h-4 w-4" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="faq-question" className="text-sm font-medium text-gray-700">Question</label>
          <Input id="faq-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Enter FAQ question" className="h-11" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Answer</label>
          <RichTextEditor value={answer} onChange={setAnswer} placeholder="Write the FAQ answer..." />
        </div>
        <button type="submit" disabled={createMutation.isPending} className="h-11 w-full rounded-md bg-[#2b3674] text-sm font-semibold text-white transition-colors hover:bg-[#20285f] disabled:opacity-60">{createMutation.isPending ? "Adding..." : "Add FAQ"}</button>
      </form>
    </div>
  );
}
