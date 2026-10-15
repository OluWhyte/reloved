"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-api";
import { api } from "@/lib/api";
import { CATEGORIES, type SelectionMethod } from "@/lib/types";

export default function ListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [originStory, setOriginStory] = useState("");
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("fcfs");
  const [photoUrl, setPhotoUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <h1 className="text-xl font-black">Sign in to list an item</h1>
        <p className="mt-2 text-sm text-stone-500">
          Listing is free — donors never pay delivery.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/signin" className="btn-dark">Sign in</Link>
          <Link href="/signup" className="btn-primary">Sign up</Link>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 4) return setErr("Give your item a clear title.");
    if (description.trim().length < 10) return setErr("Add a short description (10+ chars).");
    if (!location.trim()) return setErr("Add pickup location (area + city).");
    if (!originStory.trim()) return setErr("Share a quick Reloved Memory origin story.");
    try {
      const { item } = await api.createListing({
        donorId: user.id,
        donorName: user.name,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        originStory: originStory.trim(),
        photos: photoUrl.trim() ? [photoUrl.trim()] : [],
        selectionMethod,
      });
      router.push(`/items/${item.id}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not publish. Try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card space-y-4 p-6 sm:p-8">
        <h1 className="text-2xl font-black">Step 1 — List your item</h1>
        <p className="text-sm text-stone-500">
          $0 cost to you as donor. Choose how the recipient is picked.
        </p>
        {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Title e.g. 2-Seater Sofa — Barely Used" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="input min-h-24" placeholder="Description, condition, pickup notes…" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className="input" placeholder="Location e.g. Lekki Phase 1, Lagos" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <textarea className="input min-h-20" placeholder="Reloved Memory — origin story e.g. Bought when my daughter was born…" value={originStory} onChange={(e) => setOriginStory(e.target.value)} />
          <input className="input" placeholder="Photo URL (optional — paste image link)" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setSelectionMethod("fcfs")} className={`rounded-xl border p-4 text-left ${selectionMethod === "fcfs" ? "border-emerald-600 bg-emerald-50" : "border-stone-200 bg-white"}`}>
              <div className="font-bold">Option A — First Come, First Served</div>
              <div className="text-sm text-stone-500">Auto-lock for the very first applicant.</div>
            </button>
            <button type="button" onClick={() => setSelectionMethod("manual")} className={`rounded-xl border p-4 text-left ${selectionMethod === "manual" ? "border-emerald-600 bg-emerald-50" : "border-stone-200 bg-white"}`}>
              <div className="font-bold">Option B — Manual Selection</div>
              <div className="text-sm text-stone-500">You review applicants and pick. Defaults to first if you don&apos;t pick.</div>
            </button>
          </div>
          <button className="btn-primary w-full" type="submit">Publish listing</button>
        </form>
      </div>
    </div>
  );
}
