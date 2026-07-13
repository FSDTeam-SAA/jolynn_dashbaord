"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Pagination from "@/components/pagination/Pagination";
import ViewFaq from "./ViewFaq";

interface Faq {
  id: number;
  question: string;
  answer: string;
}

const answer =
  "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>";
const initialFaqs: Faq[] = [
  { id: 1, question: "What services do I get on Sidequote?", answer },
  { id: 2, question: "Can I register my business here?", answer },
  { id: 3, question: "What are the requirements?", answer },
  { id: 4, question: "Can I report scams?", answer },
  { id: 5, question: "How do I contact a service provider?", answer },
  { id: 6, question: "How can I update my profile?", answer },
  { id: 7, question: "Is registration free?", answer },
  { id: 8, question: "How are providers verified?", answer },
  { id: 9, question: "Can I change my password?", answer },
  { id: 10, question: "How do I submit a review?", answer },
  { id: 11, question: "What payment methods are supported?", answer },
  { id: 12, question: "How can I delete my account?", answer },
];

export default function FAQList() {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [page, setPage] = useState(1);
  const [selectedFaqId, setSelectedFaqId] = useState<number | null>(null);
  const limit = 5;
  const paginatedFaqs = faqs.slice((page - 1) * limit, page * limit);
  const selectedFaq = faqs.find((faq) => faq.id === selectedFaqId);

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
        <div className="flex justify-end">
          <Link
            href="/faq-management/add"
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#2b3674] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#20285f]"
          >
            <Plus className="h-4 w-4" /> Add FAQ
          </Link>
        </div>
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Question</th>
                <th className="px-4 py-3.5 text-center">Answer</th>
                <th className="rounded-tr-xl py-3.5 pl-4 pr-6 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {paginatedFaqs.map((faq) => (
                <tr
                  key={faq.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="py-4 pl-6 pr-4 font-semibold text-[#3b4cb8]">
                    {faq.question}
                  </td>
                  <td className="max-w-[520px] px-4 py-4 text-center text-gray-600">
                    <div
                      className="line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </td>
                  <td className="py-4 pl-4 pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/faq-management/edit/${faq.id}`}
                        aria-label={`Edit ${faq.question}`}
                        className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:border-[#2b3674] hover:bg-[#eef2ff]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setSelectedFaqId(faq.id)}
                        aria-label={`View ${faq.question}`}
                        className="rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:border-[#2b3674] hover:bg-[#eef2ff]"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFaqs((current) =>
                            current.filter((item) => item.id !== faq.id),
                          )
                        }
                        aria-label={`Delete ${faq.question}`}
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
          total={faqs.length}
          currentCount={paginatedFaqs.length}
          onPageChange={setPage}
        />
      </div>
      {selectedFaq && (
        <ViewFaq
          isOpen={selectedFaqId !== null}
          onClose={() => setSelectedFaqId(null)}
          faqId={selectedFaq.id}
          faq={selectedFaq}
        />
      )}
    </>
  );
}
