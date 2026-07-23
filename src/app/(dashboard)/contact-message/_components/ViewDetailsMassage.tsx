"use client";

import { CalendarDays, Mail, MessageSquareText, Phone, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ContactMessage } from "./ContactMessageList";

type ViewDetailsMassageProps = {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
};

export default function ViewDetailsMassage({
  isOpen,
  onClose,
  messageId,
}: ViewDetailsMassageProps) {
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;

  const {
    data: response,
    isPending,
    isError,
    error,
  } = useQuery<{ success: boolean; message: string; data: ContactMessage }>({
    queryKey: ["contactMessage", messageId, accessToken],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/contact/${messageId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch message details");
      }
      return data;
    },
    enabled: isOpen && Boolean(accessToken),
  });

  const contact = response?.data;
  const formattedDate = contact
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(contact.createdAt))
    : "";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-h-[88vh] w-[94%] max-w-[680px] gap-0 overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl"
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
      >
        <div className="h-2 rounded-t-2xl bg-[#2b3674]" />
        <div className="p-6 sm:p-8">
          <DialogHeader className="border-b border-gray-100 pb-5">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-[#292D73]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2ff]">
                <MessageSquareText className="h-5 w-5" />
              </span>
              Contact Message Details
            </DialogTitle>
          </DialogHeader>

          {isPending && (
            <div className="py-12 text-center text-sm text-gray-500">
              Loading message details...
            </div>
          )}
          {isError && (
            <div className="py-12 text-center text-sm text-red-600">
              {error instanceof Error
                ? error.message
                : "Unable to load message details"}
            </div>
          )}
          {contact && (
            <div className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail icon={User} label="Sender">
                  {contact.firstName} {contact.lastName}
                </Detail>
                <Detail icon={CalendarDays} label="Received At">
                  {formattedDate}
                </Detail>
                <Detail icon={Mail} label="Email">
                  <a
                    href={`mailto:${contact.email}`}
                    className="break-all text-[#3b4cb8] hover:underline"
                  >
                    {contact.email}
                  </a>
                </Detail>
                <Detail icon={Phone} label="Phone">
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-[#3b4cb8] hover:underline"
                  >
                    {contact.phone}
                  </a>
                </Detail>
              </div>
              <div className="mt-5 rounded-xl border border-gray-100 bg-slate-50 p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#292D73]">
                  <MessageSquareText className="h-4 w-4" />
                  Message
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-600">
                  {contact.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        <Icon className="h-4 w-4 text-[#2b3674]" />
        {label}
      </div>
      <div className="text-sm font-medium text-gray-700">{children}</div>
    </div>
  );
}
