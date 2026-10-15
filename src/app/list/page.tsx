"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-api";
import { api } from "@/lib/api";
import { CATEGORIES, type Listing, type SelectionMethod } from "@/lib/types";

export default function ListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [originStory, setOriginStory] = useState("");
  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>("fcfs");
  const [photoUrl, setPhotoUrl] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [guestItem, setGuestItem] = useState<Listing | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guest donors leave contact details on the listing instead of signing up.
    if (!user) {
      if (name.trim().length < 2) return setErr("Add your name so recipients know who they're collecting from.");
      if (phone.trim().length < 7) return setErr("Add a phone/WhatsApp number — admin calls you to arrange pickup.");
    }
    if (title.trim().length < 4) return setErr("Give your item a clear title.");
    if (description.trim().length < 10) return setErr("Add a short description (10+ chars).");
    if (!location.trim()) return setErr("Add pickup location (area + city).");
    if (!originStory.trim()) return setErr("Share a quick Reloved Memory origin story.");
    try {
      const { item } = await api.createListing({
        donorId: user?.id,
        donorName: user?.name ?? name.trim(),
        donorPhone: user ? undefined : phone.trim(),
        donorEmail: user ? undefined : email.trim() || undefined,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        originStory: originStory.trim(),
        photos: photoUrl.trim() ? [photoUrl.trim()] : [],
        selectionMethod,
      });
      if (user) router.push(`/items/${item.id}`);
      else setGuestItem(item);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not publish. Try again.");
    }
  };

  if (guestItem) {
    return (
      <div className="card mx-auto max-w-xl space-y-4 p-8 text-center">
        <div className="text-4xl">🎉</div>
        <h1 className="text-2xl font-black">Your listing is live!</h1>
        <p className="text-sm text-stone-600">
          Recipients can now claim <b>{guestItem.title}</b>. Keep this delivery code — the courier
          needs it at handover:
        </p>
        <div className="rounded-xl bg-stone-900 px-4 py-3 text-lg font-black tracking-widest text-white">
          {guestItem.deliveryCode}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/items/${guestItem.id}`} className="btn-primary">View listing</Link>
          <Link href="/" className="btn-ghost">Browse more items</Link>
        </div>
        <p className="text-xs text-stone-500">
          Claims and delivery updates reach you via the phone number on the listing — admin will
          call/WhatsApp you.{" "}
          <Link href="/signup" className="font-semibold text-emerald-700 underline">Create an account</Link>{" "}
          next time to earn +1 karma per delivery and track everything in one dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card space-y-4 p-6 sm:p-8">
        <h1 className="text-2xl font-black">Step 1 — List your item</h1>
        <p className="text-sm text-stone-500">
          $0 cost to you as donor. No account needed — just tell us how to reach you for pickup.
        </p>
        {!user && (
          <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            Listing as a guest — leave your contact details below.{" "}
            <Link href="/signup" className="font-semibold underline">Sign up</Link> instead to earn
            +1 karma per delivery and track claims in a dashboard.
          </div>
        )}
        {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}
        <form onSubmit={submit} className="space-y-3">
          {!user && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="input" placeholder="Phone / WhatsApp (for pickup calls)" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <input className="input sm:col-span-2" placeholder="Email (optional — claim updates)" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}
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
