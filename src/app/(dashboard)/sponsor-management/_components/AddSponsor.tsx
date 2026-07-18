"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import RichTextEditor from "./RichTextEditor";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function AddSponsor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { data: session } = useSession();
  const accessToken = (session?.user as { accessToken?: string } | undefined)
    ?.accessToken;

  const createMutation = useMutation({
    mutationFn: async (body: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/sponsor`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body,
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success)
        throw new Error(data?.message || "Failed to add sponsor");
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Sponsor added successfully");
      router.push("/sponsor-management");
    },
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
    if (!title.trim() || !content.trim() || !imageFile)
      return toast.error("Title, content and image are required");
    const body = new FormData();
    body.append("title", title.trim());
    body.append("content", content);
    body.append("image", imageFile);
    createMutation.mutate(body);
  };

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5">
        <h2 className="text-xl font-bold text-gray-800">Add New Sponsor</h2>
        <CloseButton onClose={() => router.push("/sponsor-management")} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="sponsor-title"
            className="text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <Input
            id="sponsor-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter sponsor title"
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
          onRemove={() => {
            setImage("");
            setImageFile(null);
          }}
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="h-11 w-full rounded-md !cursor-pointer bg-[#2b3674] text-sm font-semibold text-white transition-colors hover:bg-[#20285f] disabled:opacity-60"
        >
          {createMutation.isPending ? "Adding..." : "Add Sponsor"}
        </button>
      </form>
    </div>
  );
}

export function ImageUpload({
  image,
  onImage,
  onRemove,
}: {
  image: string;
  onImage: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-gray-700">Cover Image</span>
      <div className="relative flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4">
        {image ? (
          <div className="relative overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt="Sponsor cover preview"
              className="h-32 w-64 object-cover"
            />
            <button
              type="button"
              onClick={onRemove}
              aria-label="Remove image"
              className="absolute bottom-2 right-2 rounded bg-red-600 p-1.5 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center gap-2 text-center text-sm text-gray-500">
            <Camera className="h-7 w-7 text-gray-700" />
            <span>Drag and drop files or click to browse</span>
            <span className="text-xs">JPG, PNG up to 50MB</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={onImage}
              className="sr-only"
            />
          </label>
        )}
      </div>
    </div>
  );
}

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="rounded-md p-1 text-gray-700 hover:bg-slate-100"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
