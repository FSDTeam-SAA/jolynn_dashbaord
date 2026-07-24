"use client";

import { useState } from "react";
import { Eye, Mail, Phone, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Pagination from "@/components/pagination/Pagination";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import ViewDetailsMassage from "./ViewDetailsMassage";

export type ContactMessage = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

type ContactMessageResponse = {
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: ContactMessage[];
};

export default function ContactMessageList() {
  const [page, setPage] = useState(1);
  const [messageToView, setMessageToView] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(
    null,
  );
  const limit = 10;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;

  const {
    data: response,
    isPending,
    isError,
    error,
  } = useQuery<ContactMessageResponse>({
    queryKey: ["contactMessages", page, accessToken],
    queryFn: async () => {
      const params = new URLSearchParams({
        sortBy: "createdAt",
        limit: String(limit),
        page: String(page),
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contact?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch contact messages");
      }
      return data;
    },
    enabled: Boolean(accessToken),
  });

  const messages = response?.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contact/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete contact message");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Contact message deleted");
      setMessageToDelete(null);
      if (messages.length === 1 && page > 1) setPage((current) => current - 1);
      queryClient.invalidateQueries({ queryKey: ["contactMessages"] });
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  return (
    <>
      <section className="flex w-full flex-col gap-6">
        {/* <div>
          <h1 className="text-xl font-bold text-[#292D73]">Contact Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage messages received from the contact form.
          </p>
        </div> */}

        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Sender</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Message</th>
                <th className="px-4 py-3.5 text-center">Received At</th>
                <th className="rounded-tr-xl py-3.5 pl-4 pr-6 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {isPending && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Loading contact messages...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-red-600">
                    {error instanceof Error
                      ? error.message
                      : "Unable to load contact messages"}
                  </td>
                </tr>
              )}
              {!isPending &&
                !isError &&
                messages.map((contact) => {
                  const fullName =
                    `${contact.firstName} ${contact.lastName}`.trim();
                  return (
                    <tr
                      key={contact._id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] font-bold text-[#2b3674]">
                            {contact.firstName?.charAt(0).toUpperCase()}
                            {contact.lastName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#3b4cb8]">
                            {fullName || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          <a
                            href={`mailto:${contact.email}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-[#2b3674] hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {contact.email}
                          </a>
                          <a
                            href={`tel:${contact.phone}`}
                            className="flex items-center gap-2 text-gray-600 hover:text-[#2b3674] hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {contact.phone}
                          </a>
                        </div>
                      </td>
                      <td className="max-w-[330px] px-4 py-4 text-gray-600">
                        <p className="line-clamp-2 leading-6">
                          {contact.message}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-center text-gray-500">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="py-4 pl-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setMessageToView(contact._id)}
                            aria-label={`View message from ${fullName}`}
                            title="View details"
                            className="cursor-pointer rounded-md border border-[#2b3674]/25 p-2 text-[#2b3674] transition-colors hover:bg-[#eef2ff]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setMessageToDelete(contact)}
                            aria-label={`Delete message from ${fullName}`}
                            title="Delete message"
                            className="cursor-pointer rounded-md border border-red-200 p-2 text-red-600 transition-colors hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {!isPending && !isError && !messages.length && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No contact messages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isPending && !isError && (
          <Pagination
            page={page}
            limit={limit}
            total={response?.meta.total ?? 0}
            currentCount={messages.length}
            onPageChange={setPage}
          />
        )}
      </section>

      {messageToView && (
        <ViewDetailsMassage
          isOpen
          messageId={messageToView}
          onClose={() => setMessageToView(null)}
        />
      )}

      <DeleteModal
        isOpen={Boolean(messageToDelete)}
        onClose={() => setMessageToDelete(null)}
        onConfirm={() =>
          messageToDelete && deleteMutation.mutate(messageToDelete._id)
        }
        itemName={
          messageToDelete
            ? `${messageToDelete.firstName} ${messageToDelete.lastName}'s message`
            : "this message"
        }
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
