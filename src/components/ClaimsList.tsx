"use client";
import Link from "next/link";
import type { Claim, Listing } from "@/lib/types";
import { formatNaira } from "@/lib/delivery";

export function ClaimsList({ claims, listings, onPay, onPickup, onReceipt }: {
  claims: Claim[];
  listings: Listing[];
  onPay: (c: Claim) => void;
  onPickup: (c: Claim) => void;
  onReceipt: (c: Claim) => void;
}) {
  return (
    <div className="card space-y-3 p-4 sm:p-5">
      <h2 className="font-black">My claims ({claims.length})</h2>
      {claims.map((c) => {
        const l = listings.find((x) => x.id === c.listingId);
        return (
          <div key={c.id} className="rounded border border-stone-200 p-3 text-sm">
            <div className="break-words font-bold">{l?.title ?? "Item"}</div>
            <div className="text-stone-500">{c.deliveryMethod} · {c.status.replace("_", " ")}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.deliveryMethod === "courier" && c.status === "pending" && (
                <button onClick={() => onPay(c)} className="btn-primary px-3 py-1.5 text-sm">Pay {formatNaira(c.fee)}</button>
              )}
              {c.deliveryMethod === "pickup" && (c.status === "pending" || c.status === "locked") && (
                <button onClick={() => onPickup(c)} className="btn-dark px-3 py-1.5 text-sm">Confirm pickup</button>
              )}
              {["paid", "pickup_confirmed", "in_transit", "locked"].includes(c.status) && (
                <button onClick={() => onReceipt(c)} className="btn-primary px-3 py-1.5 text-sm">Confirm receipt</button>
              )}
              {c.status === "delivered" && <Link href="/impact" className="btn-ghost px-3 py-1.5 text-sm">Thank-you story</Link>}
            </div>
          </div>
        );
      })}
      {claims.length === 0 && <p className="text-sm text-stone-500">No claims yet.</p>}
    </div>
  );
}
