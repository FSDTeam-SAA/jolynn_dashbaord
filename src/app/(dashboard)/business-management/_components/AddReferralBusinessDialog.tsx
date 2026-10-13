"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, ImagePlus, Plus, Star, X } from "lucide-react";
import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

type Category = { _id: string; name: string; isActive?: boolean };
type LocationState = {
  mongoId: string;
  name: string;
  countryName?: string;
};

type AddReferralBusinessDialogProps = {
  token?: string;
  onCreated?: () => void;
};

const inputClass =
  "mt-2 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 text-sm text-[#344054] outline-none focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15";

const getApiUrl = () => process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "");

export default function AddReferralBusinessDialog({
  token,
  onCreated,
}: AddReferralBusinessDialogProps) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);
  const apiUrl = getApiUrl();

  const categoriesQuery = useQuery<{ data: Category[] }>({
    queryKey: ["public-service-categories", "referral-form"],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/service-categories/public?sortBy=sortOrder&limit=100&page=1`,
      );
      const result = await response.json();
      if (!response.ok || !result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || "Unable to load categories.");
      }
      return result;
    },
    enabled: Boolean(apiUrl && open),
  });

  const statesQuery = useQuery<{ data: LocationState[] }>({
    queryKey: ["location-states", "US", "referral-form"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/locations/states?countryCode=US`);
      const result = await response.json();
      if (!response.ok || !result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || "Unable to load states.");
      }
      return result;
    },
    enabled: Boolean(apiUrl && open),
  });

  const selectedState = (statesQuery.data?.data ?? []).find(
    (state) => state.name === stateName,
  );
  const citiesQuery = useQuery<{ data: { cities: string[] } }>({
    queryKey: ["location-cities", selectedState?.mongoId, "referral-form"],
    queryFn: async () => {
      const params = new URLSearchParams({
        countryName: selectedState?.countryName || "United States",
        limit: "500",
      });
      const response = await fetch(
        `${apiUrl}/locations/states/${encodeURIComponent(selectedState!.mongoId)}/cities?${params}`,
      );
      const result = await response.json();
      if (!response.ok || !result?.success || !Array.isArray(result.data?.cities)) {
        throw new Error(result?.message || "Unable to load cities.");
      }
      return result;
    },
    enabled: Boolean(apiUrl && open && selectedState?.mongoId),
  });

  const createReferral = useMutation({
    mutationFn: async (body: FormData) => {
      if (!apiUrl || !token) throw new Error("Your dashboard session has expired.");
      const response = await fetch(`${apiUrl}/business-referrals`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        const message = Array.isArray(result?.message)
          ? result.message[0]
          : result?.message;
        throw new Error(message || "Unable to submit this referral.");
      }
      return result;
    },
  });

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  const resetForm = () => {
    setCategoryId("");
    setStateName("");
    setCity("");
    setRating(0);
    setFormMessage("");
    setImagePreview(null);
    if (imageInput.current) imageInput.current.value = "";
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && !token) {
      toast.error("Your dashboard session has expired. Please sign in again.");
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setImagePreview(null);
      setFormMessage("Please upload an image of 5 MB or smaller.");
      return;
    }
    setFormMessage("");
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createReferral.isPending) return;
    setFormMessage("");
    const form = event.currentTarget;
    const values = new FormData(form);
    const businessName = String(values.get("businessName") ?? "").trim();
    const businessEmail = String(values.get("businessEmail") ?? "").trim();
    const businessPhone = String(values.get("businessPhone") ?? "").trim();
    const review = String(values.get("review") ?? "").trim();
    const image = values.get("image");

    if (businessName.length < 2) return setFormMessage("Please enter a business name.");
    if (!categoryId) return setFormMessage("Please select a category.");
    if (!stateName || !city) return setFormMessage("Please select the business state and city.");
    if (!(image instanceof File) || !image.size) return setFormMessage("Please upload a business image.");
    if (!businessEmail) return setFormMessage("Please enter the business email address.");
    if (!rating || review.length < 10) {
      return setFormMessage("Please select a rating and write a review of at least 10 characters.");
    }

    const body = new FormData();
    body.append("businessName", businessName);
    body.append("serviceCategoryId", categoryId);
    body.append("state", stateName);
    body.append("city", city);
    body.append("businessEmail", businessEmail.toLowerCase());
    if (businessPhone) body.append("businessPhone", businessPhone);
    body.append("rating", String(rating));
    body.append("review", review);
    body.append("image", image);

    createReferral.mutate(body, {
      onSuccess: () => {
        toast.success("Business referral submitted successfully.");
        onCreated?.();
        setOpen(false);
        form.reset();
        resetForm();
      },
      onError: (error) => setFormMessage(
        error instanceof Error ? error.message : "Unable to submit this referral.",
      ),
    });
  };

  const categories = (categoriesQuery.data?.data ?? []).filter(
    (category) => category.isActive !== false,
  );
  const cities = citiesQuery.data?.data.cities ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2b3674] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222b5d]"
      >
        <Plus className="h-4 w-4" />
        Add a business
      </button>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] !max-w-4xl overflow-y-auto gap-0 rounded-xl p-0"
      >
        <DialogHeader className="border-b border-[#E4E8EF] bg-[#F7F9FF] p-5 text-left sm:p-6">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              <DialogTitle className="text-xl font-extrabold text-[#292D73]">
                Refer a Business
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-[#667085]">
                Recommend a business and share your experience. Fields marked * are required.
              </DialogDescription>
            </div>
            <Building2 className="h-6 w-6 shrink-0 text-[#292D73]" />
          </div>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="absolute right-4 top-4 rounded-md p-1.5 text-[#667085] transition hover:bg-white hover:text-[#292D73]"
            aria-label="Close referral form"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-semibold text-[#344054] sm:col-span-2">
              Business name *
              <input name="businessName" required minLength={2} maxLength={150} placeholder="Enter the business name" className={inputClass} />
            </label>
            <label className="text-xs font-semibold text-[#344054]">
              Category *
              <Select value={categoryId} onValueChange={setCategoryId} disabled={categoriesQuery.isLoading || categoriesQuery.isError}>
                <SelectTrigger className="mt-2 !h-10 w-full rounded-lg border-[#D0D5DD] bg-white text-sm text-[#344054] shadow-none focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15">
                  <SelectValue placeholder={categoriesQuery.isLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent position="popper" align="start" className="z-[100] max-h-64 overflow-y-auto border-[#D0D5DD] bg-white">
                  {categories.map((category) => <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </label>
            <label className="text-xs font-semibold text-[#344054]">
              State *
              <Select value={stateName} onValueChange={(value) => { setStateName(value); setCity(""); }} disabled={statesQuery.isLoading || statesQuery.isError}>
                <SelectTrigger className="mt-2 !h-10 w-full rounded-lg border-[#D0D5DD] bg-white text-sm text-[#344054] shadow-none focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15">
                  <SelectValue placeholder={statesQuery.isLoading ? "Loading states..." : "Select a state"} />
                </SelectTrigger>
                <SelectContent position="popper" align="start" className="z-[100] max-h-64 overflow-y-auto border-[#D0D5DD] bg-white">
                  {(statesQuery.data?.data ?? []).map((state) => <SelectItem key={state.mongoId} value={state.name}>{state.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </label>
            <label className="text-xs font-semibold text-[#344054]">
              City *
              <Select value={city} onValueChange={setCity} disabled={!selectedState || citiesQuery.isLoading || citiesQuery.isError}>
                <SelectTrigger className="mt-2 !h-10 w-full rounded-lg border-[#D0D5DD] bg-white text-sm text-[#344054] shadow-none focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15">
                  <SelectValue placeholder={!selectedState ? "Select a state first" : citiesQuery.isLoading ? "Loading cities..." : "Select a city"} />
                </SelectTrigger>
                <SelectContent position="popper" align="start" className="z-[100] max-h-64 overflow-y-auto border-[#D0D5DD] bg-white">
                  {cities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </label>
            <label className="text-xs font-semibold text-[#344054]">
              Business email *
              <input name="businessEmail" type="email" required maxLength={254} placeholder="hello@business.com" className={inputClass} />
            </label>
            <label className="text-xs font-semibold text-[#344054]">
              Business phone
              <input name="businessPhone" type="tel" maxLength={30} placeholder="Enter phone number" className={inputClass} />
            </label>
            <label className="text-xs font-semibold text-[#344054] sm:col-span-2 lg:col-span-1">
              Business image *
              <span className="mt-2 flex min-h-[42px] items-center gap-2 rounded-lg border border-dashed border-[#A8B2D1] bg-[#F8FAFF] px-3 py-2 text-sm font-normal text-[#475467]">
                <ImagePlus className="h-4 w-4 shrink-0 text-[#292D73]" />
                <span className="min-w-0 flex-1 truncate">{imagePreview ? "Image selected" : "Upload an image"}</span>
                <input ref={imageInput} name="image" type="file" accept="image/*" required className="w-[115px] text-xs file:mr-2 file:rounded-md file:border-0 file:bg-[#E6E9FA] file:px-2 file:py-1 file:text-xs file:font-semibold file:text-[#292D73]" onChange={handleImageChange} />
              </span>
              <span className="mt-1 block text-[11px] font-normal text-[#667085]">Maximum file size: 5 MB.</span>
            </label>
          </div>

          {imagePreview && (
            <div className="relative h-36 overflow-hidden rounded-lg border border-[#D0D5DD] bg-[#F8FAFC] sm:h-44">
              <Image src={imagePreview} alt="Business image preview" fill unoptimized className="object-cover" />
              <button type="button" onClick={() => { setImagePreview(null); if (imageInput.current) imageInput.current.value = ""; }} className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#475467] shadow-sm hover:bg-white" aria-label="Remove business image"><X className="h-4 w-4" /></button>
            </div>
          )}

          <p className="text-xs text-[#667085]">The business email is required so we can send its secure claim link. Phone is optional.</p>
          <fieldset>
            <legend className="text-xs font-semibold text-[#344054]">Your rating *</legend>
            <div className="mt-2 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => setRating(value)} className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]" aria-label={`${value} ${value === 1 ? "star" : "stars"}`}>
                  <Star className={`h-7 w-7 ${value <= rating ? "fill-[#FFB800] text-[#FFB800]" : "text-[#98A2B3]"}`} />
                </button>
              ))}
              <span className="text-xs text-[#667085]">{rating ? `${rating}/5` : "Select rating"}</span>
            </div>
          </fieldset>
          <label className="block text-xs font-semibold text-[#344054]">
            Your review *
            <textarea name="review" required minLength={10} maxLength={1500} rows={4} placeholder="Tell us about your experience with this business..." className={`${inputClass} resize-y`} />
          </label>

          {formMessage && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{formMessage}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => handleOpenChange(false)} className="rounded-lg border border-[#D0D5DD] px-5 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F8FAFC]">Cancel</button>
            <button type="submit" disabled={createReferral.isPending || categoriesQuery.isLoading || categoriesQuery.isError || !categories.length} className="rounded-lg bg-[#292D73] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20255F] disabled:cursor-not-allowed disabled:opacity-50">{createReferral.isPending ? "Publishing..." : "Submit Referral"}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
