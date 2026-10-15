"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-api";
import { api } from "@/lib/api";
import type { Claim, Listing } from "@/lib/types";
import { STORY_LABEL } from "@/lib/brand";
import { distanceToFee, formatNaira } from "@/lib/delivery";

export default function ItemPage() {
  return (
    <Suspense fallback={<div className="card p-10 text-center">Loading item…</div>}>
      <ItemDetail />
    </Suspense>
  );
}

function ItemDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<Listing | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [distanceKm, setDistanceKm] = useState(5);
  const [method, setMethod] = useState<"pickup" | "courier">("pickup");
  const [msg, setMsg] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const reload = useCallback(async () => {
    try {
      const [{ item }, { claims }] = await Promise.all([api.listing(id), api.claims({ listingId: id })]);
      setItem(item);
      setClaims(claims);
    } catch {
      setNotFound(true);
    }
  }, [id]);

  useEffect(() => {
    const t = setTimeout(reload, 0);
    return () => clearTimeout(t);
  }, [reload]);

  const fee = useMemo(() => distanceToFee(distanceKm), [distanceKm]);
  const mine = user ? claims.find((c) => c.recipientId === user.id) : undefined;
  if (notFound) return <div className="card p-10 text-center">Not found. <Link className="underline" href="/">Back</Link></div>;
  if (!item) return <div className="card p-10 text-center">Loading…</div>;

  const wantThis = async () => {
    if (!user) { router.push("/signin"); return; }
    if (item.donorId === user.id) { setMsg("You can't claim your own listing."); return; }
    if (mine) { setMsg("You already applied. Track it in Dashboard."); return; }
    try {
      const { claim, listing } = await api.createClaim({
        listingId: item.id,
        recipientId: user.id,
        recipientName: user.name,
        deliveryMethod: method,
        distanceKm,
      });
      setItem(listing);
      setClaims((prev) => [...prev, claim]);
      if (claim.status === "locked") {
        setMsg("Locked for you (FCFS). Confirm pickup or pay courier in Dashboard.");
      } else {
        setMsg(method === "courier"
          ? `Applied. Pay ${formatNaira(claim.fee)} courier fee in Dashboard to lock it.`
          : "Applied. Donor reviews manual picks — first applicant wins by default.");
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not apply. Try again.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card overflow-hidden lg:col-span-2">
        <div className="grid h-56 place-items-center bg-gradient-to-br from-stone-200 to-stone-100 text-7xl">
          {item.photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.photos[0]} alt={item.title} className="h-full w-full object-cover" />
          ) : (<span>📦</span>)}
        </div>
        <div className="space-y-3 p-6">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="badge bg-stone-900 text-white">{item.status.replace("_", " ")}</span>
            <span className="badge bg-stone-100 text-stone-600">{item.category}</span>
            <span className="badge bg-stone-100 text-stone-700">
              {item.selectionMethod === "fcfs" ? "FCFS auto-lock" : "Manual pick"}
            </span>
          </div>
          <h1 className="text-2xl font-black">{item.title}</h1>
          <p className="text-sm text-stone-500">{item.location} · by {item.donorName}</p>
          <p className="text-stone-700">{item.description}</p>
          <div className="rounded-xl bg-stone-100 p-4 text-sm">
            <div className="font-bold">{STORY_LABEL}</div>
            <div className="italic text-stone-600">&ldquo;{item.originStory}&rdquo;</div>
          </div>
          {item.lockedByName && <p className="text-sm font-semibold text-stone-700">Locked for {item.lockedByName}</p>}
        </div>
      </div>
      <div className="card h-fit space-y-4 p-6">
        <h2 className="text-lg font-black">Step 2 — I Want This</h2>
        {msg && <div className="rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium text-stone-800">{msg}</div>}
        <div className="grid gap-2">
          <button onClick={() => setMethod("pickup")} className={`rounded-none border p-3 text-left text-sm ${method === "pickup" ? "border-stone-900 bg-stone-100" : "border-stone-200"}`}>
            <b>Self-Pickup — Free</b>
            <div className="text-stone-500">Verified Safe Spot meetup.</div>
          </button>
          <button onClick={() => setMethod("courier")} className={`rounded-none border p-3 text-left text-sm ${method === "courier" ? "border-stone-900 bg-stone-100" : "border-stone-200"}`}>
            <b>Courier — Paid by you</b>
            <div className="text-stone-500">₦0 cost to donor.</div>
          </button>
        </div>
        {method === "courier" && (
          <div>
            <label className="text-sm font-semibold">Distance {distanceKm}km — {formatNaira(fee)}</label>
            <input type="range" min={1} max={45} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} className="w-full" />
          </div>
        )}
        <button onClick={wantThis} className="btn-primary w-full">I Want This!</button>
        <Link href="/dashboard" className="btn-ghost block text-center">Track in Dashboard</Link>
      </div>
    </div>
  );
}