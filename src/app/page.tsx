"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-api";
import { api } from "@/lib/api";
import { CATEGORIES, type Listing } from "@/lib/types";

function statusBadge(s: Listing["status"]) {
  if (s === "available") return "bg-emerald-100 text-emerald-800";
  if (s === "locked") return "bg-amber-100 text-amber-800";
  if (s === "in_transit") return "bg-sky-100 text-sky-800";
  return "bg-stone-200 text-stone-700";
}

export default function HomePage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [items, setItems] = useState<Listing[] | null>(null);
  const [storyCount, setStoryCount] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [{ items }, { stories }] = await Promise.all([api.listings(), api.stories()]);
        if (!alive) return;
        setItems(items);
        setStoryCount(stories.length);
      } catch {
        if (alive) setItems([]);
      }
    };
    const t = setTimeout(load, 0);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (items ?? []).filter((i) => {
      const okCat = cat === "All" || i.category === cat;
      const okQ =
        !needle ||
        (i.title + " " + i.description + " " + i.location).toLowerCase().includes(needle);
      return okCat && okQ;
    });
  }, [items, q, cat]);

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden">
        <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-10">
          <div className="space-y-4">
            <p className="badge bg-emerald-100 text-emerald-800">
              {storyCount}+ thank-you stories shared
            </p>
            <h1 className="text-3xl font-black leading-tight sm:text-5xl">
              Give what you don&apos;t need. Relove what you find.
            </h1>
            <p className="text-stone-600">
              Donor lists → recipient claims & pays delivery → admin dispatches pickup →
              confirm & donor earns <b>+1 karma point</b> → thank-you story on the Impact Wall.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={user ? "/list" : "/signup"} className="btn-primary">
                List an item — free
              </Link>
              <Link href="/impact" className="btn-ghost">
                See Impact Wall
              </Link>
            </div>
            {!user && (
              <p className="text-sm text-stone-500">
                <Link href="/signup" className="font-semibold text-emerald-700 underline">
                  Sign up
                </Link>{" "}
                or{" "}
                <Link href="/signin" className="font-semibold text-emerald-700 underline">
                  sign in
                </Link>{" "}
                to list and claim.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ["1", "Donor lists + picks FCFS or manual"],
              ["2", "Recipient taps I Want This + pays courier or free pickup"],
              ["3", "Admin calls donor, dispatches courier"],
              ["4", "Confirm delivery → donor +1 point"],
            ].map(([n, t]) => (
              <div key={n} className="rounded-xl bg-stone-50 p-4">
                <div className="text-2xl font-black text-emerald-600">{n}</div>
                <div className="mt-1 font-medium text-stone-700">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sofa, books, baby cot, location…"
          className="input sm:max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                cat === c ? "bg-stone-900 text-white" : "bg-white text-stone-700"
              } border border-stone-200`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => (
          <Link key={i.id} href={`/items/${i.id}`} className="card overflow-hidden hover:shadow-md">
            <div className="grid h-36 place-items-center bg-gradient-to-br from-emerald-100 to-amber-100 text-5xl">
              {i.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.photos[0]} alt={i.title} className="h-full w-full object-cover" />
              ) : (
                <span>📦</span>
              )}
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <span className={`badge ${statusBadge(i.status)}`}>{i.status.replace("_", " ")}</span>
                <span className="badge bg-stone-100 text-stone-600">{i.category}</span>
              </div>
              <h3 className="font-bold leading-snug">{i.title}</h3>
              <p className="text-sm text-stone-500">
                {i.location} · by {i.donorName}
              </p>
              <p className="line-clamp-2 text-sm text-stone-600">{i.description}</p>
              <p className="text-xs italic text-stone-500">
                “{i.originStory.slice(0, 90)}{i.originStory.length > 90 ? "…" : ""}”
              </p>
            </div>
          </Link>
        ))}
        {items === null && (
          <div className="card p-10 text-center text-stone-500 sm:col-span-3">Loading items…</div>
        )}
        {items !== null && filtered.length === 0 && (
          <div className="card p-10 text-center text-stone-500 sm:col-span-3">
            No items match. Be the first to{" "}
            <Link href="/list" className="font-semibold text-emerald-700 underline">
              list one
            </Link>
            .
          </div>
        )}
      </section>
    </div>
  );
}
