"use client";

import { CalendarDays, CheckCircle2, FileText, Tag, X, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category } from "./CategoryManagementList";

type ViewCategoryProps = {
  category: Category | null;
  onClose: () => void;
};

const formatDate = (date?: string) =>
  date
    ? new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(date))
    : "N/A";

export default function ViewCategory({ category, onClose }: ViewCategoryProps) {
  return (
    <Dialog open={Boolean(category)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        className="w-[92%] max-w-[650px] gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 shadow-2xl"
      >
        <div className="bg-[#2b3674] px-6 py-5 text-white">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 text-left">
            <div>
              <DialogTitle className="text-xl font-bold">Category Details</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-white/70">
                Complete service category information
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close category details"
              className="rounded-md p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
        </div>

        {category && (
          <div className="p-6 sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#2b3674]/10 bg-[#2b3674]/10 text-[#2b3674]">
                  <Tag className="h-5 w-5" aria-hidden="true" />
                  {category.logo?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.logo.url}
                      alt={`${category.name} logo`}
                      className="absolute inset-0 h-full w-full bg-white object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-gray-800">{category.name}</h3>
                </div>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  category.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {category.isActive ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Description</p>
                <p className="text-sm leading-6 text-gray-600">
                  {category.description || "No description has been added for this category."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Detail icon={<FileText className="h-4 w-4" />} label="Posts Count" value={String(category.businessOwnerCount ?? 0)} />
                <Detail icon={<Tag className="h-4 w-4" />} label="Status" value={category.status || "N/A"} capitalize />
                <Detail icon={<Tag className="h-4 w-4" />} label="Source" value={(category.source || "N/A").replaceAll("_", " ")} capitalize />
              </div>

              <div className="grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-2">
                <Detail icon={<CalendarDays className="h-4 w-4" />} label="Created At" value={formatDate(category.createdAt)} />
                <Detail icon={<CalendarDays className="h-4 w-4" />} label="Last Updated" value={formatDate(category.updatedAt)} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Detail({
  icon,
  label,
  value,
  capitalize = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-100 p-3">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-400">
        {icon}
        {label}
      </div>
      <p className={`text-sm font-semibold text-gray-700 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}
