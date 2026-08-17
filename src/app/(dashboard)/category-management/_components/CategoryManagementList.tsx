"use client";

import { useEffect, useState } from "react";
import { Eye, ImageIcon, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Pagination from "@/components/pagination/Pagination";
import DeleteModal from "@/components/deleteModal/DeleteModal";
import CategoryFormModal from "./CategoryFormModal";
import ViewCategory from "./ViewCategory";

export type Category = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: { url?: string; publicId?: string };
  status?: "pending" | "approved" | "rejected";
  source?: "admin" | "help_wanted" | "business_registration" | "service_creation";
  isActive: boolean;
  sortOrder?: number;
  businessOwnerCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryPayload = {
  name: string;
  description: string;
  logo: File | null;
  isActive: boolean;
  sortOrder: number;
  status?: "approved" | "rejected" | "pending";
};

type CategoryListResponse = {
  success: boolean;
  message: string;
  meta: { page: number; limit: number; total: number };
  data: Category[];
};

export default function CategoryManagementList() {
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<"add" | "edit" | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const limit = 10;
  const { data: session, status: sessionStatus } = useSession();
  const queryClient = useQueryClient();
  const sessionUser = session?.user as { accessToken?: string; token?: string } | undefined;
  const accessToken = sessionUser?.accessToken ?? sessionUser?.token;

  const { data: response, isPending, isError, error } = useQuery<CategoryListResponse>({
    queryKey: ["service-categories", page],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/service-categories?limit=${limit}&page=${page}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch service categories");
      }
      return data;
    },
    enabled: Boolean(accessToken),
  });

  const categories = response?.data ?? [];

  useEffect(() => {
    const total = response?.meta.total ?? 0;
    if (page > 1 && total > 0 && categories.length === 0) setPage(page - 1);
  }, [categories.length, page, response?.meta.total]);

  const saveMutation = useMutation({
    mutationFn: async ({
      payload,
      categoryId,
    }: {
      payload: CategoryPayload;
      categoryId?: string;
    }) => {
      const formData = new FormData();
      formData.append("name", payload.name.trim());
      formData.append("description", payload.description.trim());
      formData.append("isActive", String(payload.isActive));
      formData.append("sortOrder", String(payload.sortOrder));
      if (payload.logo) {
        formData.append("logo", payload.logo);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/service-categories${categoryId ? `/${categoryId}` : ""}`,
        {
          method: categoryId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || `Failed to ${categoryId ? "update" : "add"} category`);
      }

      if (categoryId) {
        const targetStatus = payload.status || (payload.isActive ? "approved" : "rejected");
        if (targetStatus === "approved" || targetStatus === "rejected") {
          await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/service-categories/${categoryId}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ status: targetStatus }),
            },
          );
        }
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Category saved successfully");
      setFormMode(null);
      setSelectedCategory(null);
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/service-categories/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete category");
      }
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Category deleted successfully");
      setCategoryToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
    },
    onError: (mutationError: Error) => toast.error(mutationError.message),
  });

  const closeForm = () => {
    if (saveMutation.isPending) return;
    setFormMode(null);
    setSelectedCategory(null);
  };

  return (
    <>
      <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-100">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setFormMode("add");
            }}
            className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2b3674] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#20285f]"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="bg-[#2b3674] text-[11px] font-semibold uppercase tracking-wider text-white">
                <th className="rounded-tl-xl py-3.5 pl-6 pr-4">Category Name</th>
                <th className="px-4 py-3.5 text-center">Description</th>
                <th className="px-4 py-3.5 text-center">Total</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="rounded-tr-xl py-3.5 pl-4 pr-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {isPending || sessionStatus === "loading" ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-[#2b3674]" />
                      Loading categories...
                    </span>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-red-600">
                    {error instanceof Error ? error.message : "Unable to load categories"}
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No service categories found
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="transition-colors hover:bg-slate-50/50">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-slate-50 text-gray-400">
                          <ImageIcon className="h-5 w-5" aria-hidden="true" />
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
                          <p className="font-semibold text-[#3b4cb8]">{category.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[360px] px-4 py-4 text-center text-gray-600">
                      <p className="line-clamp-2">{category.description || "—"}</p>
                    </td>
                    <td className="px-4 py-4 text-center font-medium text-gray-600">
                      {category.businessOwnerCount ?? 0}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        category.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : category.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                      }`}>
                        {category.status || "pending"}
                      </span>
                    </td>
                    <td className="py-4 pl-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(category);
                            setFormMode("edit");
                          }}
                          aria-label={`Edit ${category.name}`}
                          className="cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:bg-[#eef2ff]"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewCategory(category)}
                          aria-label={`View ${category.name}`}
                          className="cursor-pointer rounded-md border border-[#2b3674]/25 p-1.5 text-[#2b3674] hover:bg-[#eef2ff]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(category)}
                          aria-label={`Delete ${category.name}`}
                          className="cursor-pointer rounded-md border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={limit}
          total={response?.meta.total ?? 0}
          currentCount={categories.length}
          onPageChange={setPage}
          disabled={isPending}
        />
      </div>

      <CategoryFormModal
        isOpen={Boolean(formMode)}
        category={formMode === "edit" ? selectedCategory : null}
        isSaving={saveMutation.isPending}
        onClose={closeForm}
        onSubmit={(payload) =>
          saveMutation.mutate({
            payload,
            categoryId: formMode === "edit" ? selectedCategory?._id : undefined,
          })
        }
      />
      <ViewCategory category={viewCategory} onClose={() => setViewCategory(null)} />
      <DeleteModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => !deleteMutation.isPending && setCategoryToDelete(null)}
        onConfirm={() => categoryToDelete && deleteMutation.mutate(categoryToDelete._id)}
        itemName={categoryToDelete?.name || "this category"}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
