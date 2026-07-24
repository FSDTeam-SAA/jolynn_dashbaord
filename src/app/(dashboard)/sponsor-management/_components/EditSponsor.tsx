"use client";

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import RichTextEditor from "./RichTextEditor";
import { CloseButton, ImageUpload } from "./AddSponsor";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { Sponsor } from "./SponsorManagementList";

interface EditSponsorProps {
  sponsorId: string;
}

export default function EditSponsor({ sponsorId }: EditSponsorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [siteLink, setSiteLink] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)?.accessToken;

  const { data: response } = useQuery<{ success: boolean; data: Sponsor; message: string }>({
    queryKey: ["sponsor", sponsorId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sponsor/${sponsorId}`);
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to fetch sponsor");
      return data;
    },
  });

  useEffect(() => {
    if (response?.data) {
      setTitle(response.data.title);
      setSiteLink(response.data.link || "");
      setContent(response.data.content);
      setImage(response.data.image || "");
    }
  }, [response]);

  const updateMutation = useMutation({
    mutationFn: async (body: FormData) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sponsor/${sponsorId}`, { method: "PUT", headers: { Authorization: `Bearer ${accessToken}` }, body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to update sponsor");
      return data;
    },
    onSuccess: (data) => { toast.success(data?.message || "Sponsor updated successfully"); router.push("/sponsor-management"); },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error("Title and content are required");
    const body = new FormData();
    body.append("title", title.trim());
    body.append("link", siteLink.trim());
    body.append("content", content);
    if (imageFile) body.append("image", imageFile);
    updateMutation.mutate(body);
  };

  return (
    <div
      className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      data-sponsor-id={sponsorId}
    >
      <div className="flex items-center justify-between pb-5">
        <h2 className="text-xl font-bold text-gray-800">Edit Sponsor</h2>
        <CloseButton onClose={() => router.push("/sponsor-management")} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="edit-sponsor-title"
            className="text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <Input
            id="edit-sponsor-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="edit-sponsor-site-link"
            className="text-sm font-medium text-gray-700"
          >
            Site Link
          </label>
          <Input
            id="edit-sponsor-site-link"
            type="url"
            value={siteLink}
            onChange={(event) => setSiteLink(event.target.value)}
            placeholder="https://example.com"
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Content</label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write sponsor content..."
          />
        </div>
        <ImageUpload
          image={image}
          onImage={handleImage}
          onRemove={() => { setImage(""); setImageFile(null); }}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => router.push("/sponsor-management")}
            className="h-11 rounded-md bg-gray-200 text-sm font-semibold text-[#2b3674] hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="h-11 rounded-md bg-[#2b3674] text-sm font-semibold text-white hover:bg-[#20285f] disabled:opacity-60"
          >
            {updateMutation.isPending ? "Saving..." : "Save Sponsor"}
          </button>
        </div>
      </form>
    </div>
  );
}
