import { NextResponse } from "next/server";
import { db } from "@/server/db";

// Admin match queue: locked/paid/pickup_confirmed claims with donor contact.
export async function GET() {
  const store = db();
  const queue = store.claims
    .filter((c) => ["locked", "paid", "pickup_confirmed"].includes(c.status))
    .map((c) => {
      const listing = store.listings.find((l) => l.id === c.listingId);
      const donor = listing ? store.users.find((u) => u.id === listing.donorId) : undefined;
      return {
        claim: c,
        listingId: c.listingId,
        listingTitle: listing?.title ?? "Item",
        donorPhone: donor?.phone ?? "no phone saved",
      };
    });
  return NextResponse.json({ queue });
}
