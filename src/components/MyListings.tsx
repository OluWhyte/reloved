"use client";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Claim, Listing } from "@/lib/types";

export function MyListings({ listings, claims, onPick }: {
  listings: Listing[];
  claims: Claim[];
  onPick: () => void;
}) {
  const pick = async (claimId: string) => {
    try {
      await api.claimAction(claimId, "choose");
    } catch {
      // ignore
    }
    onPick();
  };
  return (
    <div className="card space-y-3 p-5">
      <h2 className="font-black">My listings ({listings.length})</h2>
      {listings.map((l) => {
        const listingClaims = claims.filter((c) => c.listingId === l.id);
        return (
          <div key={l.id} className="rounded border border-stone-200 p-3 text-sm">
            <div className="font-bold"><Link className="underline" href={`/items/${l.id}`}>{l.title}</Link></div>
            <div className="text-stone-500">{l.status} · code {l.deliveryCode}</div>
            {listingClaims.map((c) => (
              <div key={c.id} className="mt-1 flex items-center justify-between gap-2 rounded bg-stone-50 px-2 py-1">
                <span>{c.recipientName} · {c.deliveryMethod} · {c.status}</span>
                {!l.lockedClaimId && l.selectionMethod === "manual" && (
                  <button onClick={() => pick(c.id)} className="rounded-none bg-stone-900 px-2 py-1 text-xs text-white">Pick</button>
                )}
                {l.lockedClaimId === c.id && <span className="text-xs font-bold text-stone-900">CHOSEN</span>}
              </div>
            ))}
          </div>
        );
      })}
      {listings.length === 0 && <p className="text-sm text-stone-500">Nothing listed yet.</p>}
    </div>
  );
}
