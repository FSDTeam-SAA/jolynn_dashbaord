"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Category, CategoryPayload } from "./CategoryManagementList";

type CategoryFormModalProps = {
  isOpen: boolean;
  category?: Category | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: CategoryPayload) => void;
};

const initialValues: CategoryPayload = {
  name: "",
  description: "",
  isActive: true,
  sortOrder: 0,
};

export default function CategoryFormModal({
  isOpen,
  category,
  isSaving,
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [values, setValues] = useState<CategoryPayload>(initialValues);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setValues(
      category
        ? {
            name: category.name,
            description: category.description ?? "",
            isActive: category.isActive,
            sortOrder: category.sortOrder ?? 0,
          }
        : initialValues,
    );
    setNameError("");
  }, [category, isOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim()) {
      setNameError("Category name is required");
      return;
    }

    onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
      sortOrder: Number(values.sortOrder),
    });
  };

  const title = category ? "Edit Category" : "Add New Category";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        className="max-h-[90vh] w-[92%] max-w-[620px] overflow-y-auto gap-0 rounded-2xl border-0 bg-white p-0 shadow-2xl"
      >
        <div className="h-2 rounded-t-2xl bg-[#2b3674]" />
        <div className="p-6 sm:p-7">
          <DialogHeader className="flex flex-row items-start justify-between space-y-0 text-left">
            <div>
              <DialogTitle className="text-xl font-bold text-[#292D73]">{title}</DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-gray-500">
                {category
                  ? "Update this service category's information."
                  : "Create a category that can be used across services."}
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label={`Close ${title}`}
              className="rounded-md p-1.5 text-gray-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <label htmlFor="category-name" className="text-sm font-semibold text-gray-700">
                Category Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="category-name"
                value={values.name}
                onChange={(event) => {
                  setValues((current) => ({ ...current, name: event.target.value }));
                  if (nameError) setNameError("");
                }}
                placeholder="e.g. Plumbing"
                className="h-11 border-gray-200 focus-visible:ring-[#2b3674]/20"
                aria-invalid={Boolean(nameError)}
                autoFocus
              />
              {nameError && <p className="text-xs text-red-600">{nameError}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="category-description" className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <textarea
                id="category-description"
                value={values.description}
                onChange={(event) =>
                  setValues((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Write a short description of this category"
                rows={4}
                className="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#2b3674] focus:ring-2 focus:ring-[#2b3674]/10"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="category-sort-order" className="text-sm font-semibold text-gray-700">
                  Sort Order
                </label>
                <Input
                  id="category-sort-order"
                  type="number"
                  value={values.sortOrder}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value),
                    }))
                  }
                  className="h-11 border-gray-200 focus-visible:ring-[#2b3674]/20"
                />
              </div>

              <div className="flex items-end">
                <label
                  htmlFor="category-active"
                  className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-700"
                >
                  <Checkbox
                    id="category-active"
                    checked={values.isActive}
                    onCheckedChange={(checked) =>
                      setValues((current) => ({ ...current, isActive: checked === true }))
                    }
                    className="data-[state=checked]:border-[#2b3674] data-[state=checked]:bg-[#2b3674]"
                  />
                  Active category
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="h-11 rounded-md border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex h-11 items-center justify-center gap-2 rounded-md bg-[#2b3674] text-sm font-semibold text-white hover:bg-[#20285f] disabled:opacity-60"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : category ? "Save Changes" : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
