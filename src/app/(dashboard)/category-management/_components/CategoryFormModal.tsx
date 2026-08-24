"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  logo: null,
  isActive: true,
  sortOrder: 0,
  keywords: [],
  status: "approved",
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
  const [descriptionError, setDescriptionError] = useState("");
  const [logoError, setLogoError] = useState("");
  const [keywordsError, setKeywordsError] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setValues(
      category
        ? {
            name: category.name,
            description: category.description ?? "",
            logo: null,
            isActive: category.isActive,
            sortOrder: category.sortOrder ?? 0,
            keywords: category.keywords ?? [],
            status: category.status ?? (category.isActive ? "approved" : "pending"),
          }
        : initialValues,
    );
    setNameError("");
    setDescriptionError("");
    setLogoError("");
    setKeywordsError("");
    setKeywordsInput("");
    clearObjectUrl();
    setLogoPreview(category?.logo?.url ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [category, isOpen]);

  useEffect(() => () => clearObjectUrl(), []);

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    setValues((current) => {
      const alreadyAdded = current.keywords.some(
        (item) => item.toLocaleLowerCase() === trimmedKeyword.toLocaleLowerCase(),
      );
      return alreadyAdded
        ? current
        : { ...current, keywords: [...current.keywords, trimmedKeyword] };
    });
    if (keywordsError) setKeywordsError("");
    setKeywordsInput("");
  };

  const handleKeywordKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addKeyword(keywordsInput);
      return;
    }

    if (event.key === "Backspace" && !keywordsInput && values.keywords.length) {
      setValues((current) => ({
        ...current,
        keywords: current.keywords.slice(0, -1),
      }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = values.name.trim();
    const trimmedDescription = values.description.trim();

    if (!trimmedName) {
      setNameError("Category name is required");
    }
    if (!trimmedDescription) {
      setDescriptionError("Description is required");
    }
    if (!category && !values.logo) {
      setLogoError("Logo is required");
    }
    if (!trimmedName || !trimmedDescription || (!category && !values.logo)) {
      return;
    }

    const pendingKeyword = keywordsInput.trim();
    const keywords = pendingKeyword
      ? values.keywords.some((keyword) => keyword.toLocaleLowerCase() === pendingKeyword.toLocaleLowerCase())
        ? values.keywords
        : [...values.keywords, pendingKeyword]
      : values.keywords;

    if (keywords.length < 3) {
      setKeywordsError("At least 3 keywords are required");
    }

    if (keywords.length < 3) {
      return;
    }

    onSubmit({
      ...values,
      name: trimmedName,
      description: trimmedDescription,
      keywords,
      sortOrder: values.sortOrder ?? 0,
    });
  };

  const title = category ? "Edit Category" : "Add New Category";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-slate-950/35 backdrop-blur-[3px]"
        className="max-h-[90vh] w-[92%] max-w-[720px] gap-0 overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl"
      >
        <div className="h-2 rounded-t-2xl bg-[#2b3674]" />
        <div className="p-6 sm:p-8">
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
              className="cursor-pointer rounded-md p-1.5 text-gray-500 hover:bg-slate-100 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-6 space-y-2">
            <div>
              <label
                htmlFor="category-name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
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
              {nameError && <p className="mt-2 text-xs text-red-600">{nameError}</p>}
            </div>

            <div>
              <label
                htmlFor="category-description"
                className="mb-2.5 block text-sm font-semibold text-gray-700"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="category-description"
                value={values.description}
                onChange={(event) => {
                  setValues((current) => ({ ...current, description: event.target.value }));
                  if (descriptionError) setDescriptionError("");
                }}
                placeholder="Write a short description of this category"
                rows={3}
                className="w-full resize-none rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#2b3674] focus:ring-2 focus:ring-[#2b3674]/10"
              />
              {descriptionError && <p className="mt-2 text-xs text-red-600">{descriptionError}</p>}
            </div>

            <div>
              <label
                htmlFor="category-keywords"
                className="mb-2.5 block text-sm font-semibold text-gray-700"
              >
                Keywords
              </label>
              <div
                className={`rounded-md border bg-white transition focus-within:ring-2 ${
                  keywordsError
                    ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-100"
                    : "border-gray-200 focus-within:border-[#2b3674] focus-within:ring-[#2b3674]/10"
                }`}
              >
                {values.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-3 pt-3">
                    {values.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="flex items-center gap-1 rounded-full bg-[#eef0ff] px-2.5 py-1 text-xs font-medium text-[#2b3674]"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => {
                            setValues((current) => ({
                              ...current,
                              keywords: current.keywords.filter((item) => item !== keyword),
                            }));
                            if (keywordsError) setKeywordsError("");
                          }}
                          aria-label={`Remove ${keyword}`}
                          className="cursor-pointer rounded-full p-0.5 hover:bg-[#dce1ff]"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 p-2">
                  <input
                    id="category-keywords"
                    value={keywordsInput}
                    onChange={(event) => {
                      setKeywordsInput(event.target.value);
                      if (keywordsError) setKeywordsError("");
                    }}
                    onKeyDown={handleKeywordKeyDown}
                    placeholder={values.keywords.length ? "Add another keyword" : "Type a keyword"}
                    className="min-w-0 flex-1 bg-transparent px-1 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => addKeyword(keywordsInput)}
                    disabled={!keywordsInput.trim()}
                    className="shrink-0 cursor-pointer rounded-md bg-[#2b3674] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#20285f] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Press Enter or comma to add a keyword.</p>
              {keywordsError && <p className="mt-2 text-xs text-red-600">{keywordsError}</p>}
            </div>

            <div>
              <p className="mb-2.5 text-sm font-semibold text-gray-700">
                Logo {category ? "(optional)" : <span className="text-red-500">*</span>}
              </p>
              <input
                ref={fileInputRef}
                id="category-logo"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  clearObjectUrl();
                  setValues((current) => ({ ...current, logo: file }));
                  if (file) {
                    const objectUrl = URL.createObjectURL(file);
                    objectUrlRef.current = objectUrl;
                    setLogoPreview(objectUrl);
                    if (logoError) setLogoError("");
                  }
                }}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#f3f4f6] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 focus:border-[#2b3674] focus:ring-2 focus:ring-[#2b3674]/10"
              />
              {logoPreview && (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Category logo preview"
                    className="h-16 w-16 rounded-md border border-gray-200 bg-white object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-700">
                      {values.logo?.name ?? "Current logo"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Logo preview</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      clearObjectUrl();
                      setLogoPreview(null);
                      setValues((current) => ({ ...current, logo: null }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    aria-label="Remove logo preview"
                    className="cursor-pointer rounded-md border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
              {logoError && <p className="mt-2 text-xs text-red-600">{logoError}</p>}
            </div>

            <div>
              <label
                htmlFor="category-status"
                className="mb-2.5 block text-sm font-semibold text-gray-700"
              >
                Status
              </label>
              <Select
                value={values.status ?? "approved"}
                onValueChange={(val) => {
                  const newStatus = val as "approved" | "rejected" | "pending";
                  setValues((current) => ({
                    ...current,
                    status: newStatus,
                    isActive: newStatus === "approved",
                  }));
                }}
              >
                <SelectTrigger className="!h-11 w-full cursor-pointer border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-[#2b3674]/10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="approved" className="cursor-pointer">Approved</SelectItem>
                  <SelectItem value="pending" className="cursor-pointer">Pending</SelectItem>
                  <SelectItem value="rejected" className="cursor-pointer">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="h-11 cursor-pointer rounded-md border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#2b3674] text-sm font-semibold text-white hover:bg-[#20285f] disabled:opacity-60"
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
