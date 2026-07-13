"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import RichTextEditor from "./RichTextEditor";
import { CloseButton, ImageUpload } from "./AddSponsor";

interface EditSponsorProps {
  sponsorId: number;
}

export default function EditSponsor({ sponsorId }: EditSponsorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("Rivera Plumbing & Drain");
  const [content, setContent] = useState("<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>");
  const [image, setImage] = useState("");

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    // Submit { id: sponsorId, title, content, image } to the update API here.
    router.push("/sponsor-management");
  };

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" data-sponsor-id={sponsorId}>
      <div className="flex items-center justify-between pb-5">
        <h2 className="text-xl font-bold text-gray-800">Edit Sponsor</h2>
        <CloseButton onClose={() => router.push("/sponsor-management")} />
      </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="edit-sponsor-title" className="text-sm font-medium text-gray-700">Title</label>
            <Input id="edit-sponsor-title" value={title} onChange={(event) => setTitle(event.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Content</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Write sponsor content..." />
          </div>
          <ImageUpload image={image} onImage={handleImage} onRemove={() => setImage("")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => router.push("/sponsor-management")} className="h-11 rounded-md bg-gray-200 text-sm font-semibold text-[#2b3674] hover:bg-gray-300">Cancel</button>
            <button type="submit" className="h-11 rounded-md bg-[#2b3674] text-sm font-semibold text-white hover:bg-[#20285f]">Save Sponsor</button>
          </div>
        </form>
    </div>
  );
}
