"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-api";
import { api } from "@/lib/api";
import type { Claim, Listing } from "@/lib/types";
import { useDashboardActions } from "@/components/dash-actions";
import { ClaimsList } from "@/components/ClaimsList";
import { MyListings } from "@/components/MyListings";

export default function DashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      const [{ items }, { claims }] = await Promise.all([
        api.listings(),
        api.claims({ recipientId: user.id }),
      ]);
      setListings(items.filter((l) => l.donorId === user.id));
      setClaims(claims);
    } catch {
      // keep previous data on failure
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const t = setTimeout(reload, 0);
    return () => clearTimeout(t);
  }, [reload]);

  const { payFee, confirmPickup, confirmReceipt } = useDashboardActions(reload);

  if (!user) return <div className="card p-8 text-center">Sign in first. <Link className="underline" href="/signin">Sign in</Link></div>;
  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div>
          <h1 className="text-xl font-black">Hi {user.name} — {user.karmaPoints} karma</h1>
          <p className="text-sm text-stone-500">Donors earn +1 point per confirmed delivery.</p>
        </div>
        <Link href="/list" className="btn-primary">+ List item</Link>
      </div>
      {loading ? (
        <div className="card p-8 text-center text-stone-500">Loading dashboard…</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <MyListings listings={listings} claims={claims} onPick={reload} />
          <ClaimsList claims={claims} listings={listings} onPay={payFee} onPickup={confirmPickup} onReceipt={confirmReceipt} />
        </div>
      )}
    </div>
  );
}
