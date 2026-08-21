"use client";

import { useEffect, useState, useMemo } from "react";
import { Download, Loader2, Search, Trash2, Calendar, Clock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Pagination from "@/components/pagination/Pagination";
import DeleteModal from "@/components/deleteModal/DeleteModal";

export type SearchData = {
  _id: string;
  keyword: string;
  createdAt: string;
  updatedAt: string;
};

type SearchDataResponse = {
  message: string;
  meta: { page: number; limit: number; total: number };
  data: SearchData[];
};

export default function SearchHistory() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [itemToDelete, setItemToDelete] = useState<SearchData | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const limit = 10;
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const sessionUser = session?.user as { accessToken?: string; token?: string } | undefined;
  const accessToken = sessionUser?.accessToken ?? sessionUser?.token;

  // Handle Search Input Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset selections on page or search change
  useEffect(() => {
    setSelectedIds([]);
  }, [page, debouncedSearch]);

  const { data: response, isPending, isError, error } = useQuery<SearchDataResponse>({
    queryKey: ["search-data", page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(limit),
        page: String(page),
      });
      if (debouncedSearch.trim()) {
        params.append("searchTerm", debouncedSearch.trim());
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/search-data?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch search history");
      }
      return data;
    },
    enabled: Boolean(accessToken),
  });

  const searchList = useMemo(() => response?.data ?? [], [response?.data]);
  const total = response?.meta?.total ?? 0;

  useEffect(() => {
    if (page > 1 && total > 0 && searchList.length === 0) {
      setPage(page - 1);
    }
  }, [searchList.length, page, total]);

  // Select All Toggle logic for current page
  const isAllSelected = searchList.length > 0 && searchList.every((item) => selectedIds.includes(item._id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(searchList.map((item) => item._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Single Delete Mutation
  const singleDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/search-data/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete search record");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Search record deleted successfully");
      setItemToDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== itemToDelete?._id));
      queryClient.invalidateQueries({ queryKey: ["search-data"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/search-data/bulk`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ ids }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to bulk delete search records");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Selected search records deleted successfully");
      setIsBulkDeleting(false);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["search-data"] });
    },
    onError: (err: Error) => {
      setIsBulkDeleting(false);
      toast.error(err.message);
    },
  });

  // Export CSV Functionality
  const handleExportCSV = () => {
    const itemsToExport = selectedIds.length > 0
      ? searchList.filter((item) => selectedIds.includes(item._id))
      : searchList;

    if (itemsToExport.length === 0) {
      toast.error("No search data available to export");
      return;
    }

    const headers = ["ID", "Search Keyword", "Created Date", "Created Time"];
    const csvRows = [
      headers.join(","),
      ...itemsToExport.map((item) => {
        const dateObj = new Date(item.createdAt);
        const dateStr = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString("en-GB")
          : "";
        const timeStr = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : "";
        
        // Escape quotes for CSV
        const keywordEscaped = `"${item.keyword.replace(/"/g, '""')}"`;

        return [item._id, keywordEscaped, dateStr, timeStr].join(",");
      }),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `search_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${itemsToExport.length} search records to CSV`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(date);
  };

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        {/* Header Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#2b3674]">Search History</h1>
            <p className="text-xs text-gray-500 mt-1">
              View and manage search queries performed by users across the platform
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-200 bg-slate-50/50 pl-9 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-[#2b3674] focus:bg-white focus:ring-1 focus:ring-[#2b3674]"
              />
            </div>

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={isPending || searchList.length === 0}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:border-[#2b3674] hover:bg-slate-50 hover:text-[#2b3674] disabled:cursor-not-allowed disabled:opacity-50"
              title="Export search history to CSV file"
            >
              <Download className="h-4 w-4 text-[#2b3674]" />
              <span>Export CSV</span>
            </button>

            {/* Bulk Delete Button */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setIsBulkDeleting(true)}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-md bg-red-600 px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-5 pr-3 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    disabled={searchList.length === 0}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-[#2b3674]"
                    title="Select all on this page"
                  />
                </th>
                <th className="py-3.5 px-4">Search Keyword</th>
                <th className="py-3.5 px-4 text-center">Created Date</th>
                <th className="py-3.5 px-4 text-center">Time</th>
                <th className="rounded-tr-xl py-3.5 pl-4 pr-6 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {isPending || sessionStatus === "loading" ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#2b3674]" />
                      Loading search history...
                    </span>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-red-600 font-medium">
                    {error instanceof Error ? error.message : "Unable to load search history"}
                  </td>
                </tr>
              ) : searchList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No search records found
                  </td>
                </tr>
              ) : (
                searchList.map((item) => {
                  const isSelected = selectedIds.includes(item._id);
                  return (
                    <tr
                      key={item._id}
                      className={`transition-colors ${
                        isSelected ? "bg-indigo-50/40" : "hover:bg-slate-50/60"
                      }`}
                    >
                      <td className="py-4 pl-5 pr-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(item._id)}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-[#2b3674]"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#2b3674] text-sm">
                            {item.keyword}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600 font-medium">
                        <div className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-500">
                        <div className="inline-flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span>{formatTime(item.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-4 pl-4 pr-6 text-center">
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          aria-label={`Delete ${item.keyword}`}
                          className="cursor-pointer inline-flex items-center justify-center rounded-md border border-red-200 p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete keyword"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          total={total}
          currentCount={searchList.length}
          onPageChange={setPage}
          disabled={isPending}
        />
      </div>

      {/* Delete Single Item Modal */}
      <DeleteModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !singleDeleteMutation.isPending && setItemToDelete(null)}
        onConfirm={() => itemToDelete && singleDeleteMutation.mutate(itemToDelete._id)}
        itemName={itemToDelete ? `keyword "${itemToDelete.keyword}"` : "this search record"}
        isDeleting={singleDeleteMutation.isPending}
      />

      {/* Delete Bulk Items Modal */}
      <DeleteModal
        isOpen={isBulkDeleting}
        onClose={() => !bulkDeleteMutation.isPending && setIsBulkDeleting(false)}
        onConfirm={() => selectedIds.length > 0 && bulkDeleteMutation.mutate(selectedIds)}
        itemName={`${selectedIds.length} selected search record(s)`}
        isDeleting={bulkDeleteMutation.isPending}
      />
    </>
  );
}