"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-api";
import { api } from "@/lib/api";
import type { Claim } from "@/lib/types";

type QueueItem = { claim: Claim; listingId: string; listingTitle: string; donorPhone: string };

export default function AdminPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const { queue } = await api.adminQueue();
      setQueue(queue);
    } catch {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(reload, 0);
    return () => clearTimeout(t);
  }, [reload]);

  const dispatch = async (id: string) => {
    try {
      await api.claimAction(id, "dispatch");
    } catch {
      // ignore
    }
    reload();
  };

  if (!user) return <div className="card p-8 text-center">Sign in to view admin queue.</div>;
  return (
    <div className="space-y-4">
      <div className="card p-6">
        <h1 className="text-2xl font-black">Step 3 — Admin outreach and dispatch</h1>
        <p className="text-sm text-stone-500">Call / WhatsApp donor to confirm pickup window, then dispatch courier. Courier verifies item matches photos, seals and delivers.</p>
      </div>
      <div className="card space-y-3 p-5">
        <h2 className="font-black">Match queue ({queue.length})</h2>
        {loading && <p className="text-sm text-stone-500">Loading queue…</p>}
        {queue.map(({ claim: c, listingTitle, donorPhone }) => (
          <div key={c.id} className="rounded-xl border border-stone-200 p-3 text-sm">
            <div className="font-bold">{listingTitle}</div>
            <div className="text-stone-500">To {c.recipientName} via {c.deliveryMethod} · {c.status} · donor contact: {donorPhone}</div>
            <button onClick={() => dispatch(c.id)} className="btn-dark mt-2 px-3 py-1.5 text-sm">Dispatch courier</button>
          </div>
        ))}
        {!loading && queue.length === 0 && <p className="text-sm text-stone-500">No matches waiting. Locked or paid claims appear here.</p>}
      </div>
    </div>
  );
}
