"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-api";
import { api } from "@/lib/api";
import type { ThankStory } from "@/lib/types";

export default function ImpactPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<ThankStory[] | null>(null);
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const { stories } = await api.stories();
      setStories(stories);
    } catch {
      setStories([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(reload, 0);
    return () => clearTimeout(t);
  }, [reload]);

  const share = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setErr("Sign in to share a story."); return; }
    if (!title.trim() || !note.trim()) { setErr("Add item title and thank-you note."); return; }
    try {
      await api.createStory({ listingTitle: title.trim(), recipientName: user.name, note: note.trim() });
      setTitle(""); setNote(""); setErr(null); reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not post story.");
    }
  };
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-black">Step 5 — Impact Wall</h1>
        <p className="text-sm text-stone-500">Recipients post photo + thank-you note. Donors get notified — proof items reach real people.</p>
      </div>
      <div className="card space-y-3 p-5">
        <h2 className="font-black">Share your thank-you story</h2>
        {err && <div className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white">{err}</div>}
        <form onSubmit={share} className="grid gap-2">
          <input className="input" placeholder="Item received e.g. Baby Cot" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="input min-h-20" placeholder="Thank-you note…" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn-primary w-fit" type="submit">Post to Impact Wall</button>
        </form>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(stories ?? []).map((s) => (
          <div key={s.id} className="card space-y-2 p-5">
            <div className="text-xs font-bold text-stone-900">{s.listingTitle}</div>
            <p className="text-stone-700">“{s.note}”</p>
            <p className="text-sm text-stone-500">— {s.recipientName}, thanks to {s.donorName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
