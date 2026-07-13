"use client";

import React, { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/app/(dashboard)/sponsor-management/_components/RichTextEditor";

interface EditFaqProps {
  faqId: number;
}

export default function EditFaq({ faqId }: EditFaqProps) {
  const router = useRouter();
  const [question, setQuestion] = useState("Can I register my business here?");
  const [answer, setAnswer] = useState("<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    // Submit { id: faqId, question, answer } to the update-FAQ API here.
    router.push("/faq-management");
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
          <button type="submit" className="h-11 rounded-md bg-[#2b3674] text-sm font-semibold text-white hover:bg-[#20285f]">Save FAQ</button>
        </div>
      </form>
    </div>
  );
}
