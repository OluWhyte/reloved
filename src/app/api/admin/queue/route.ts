import { NextResponse } from "next/server";
import { db } from "@/server/db";

// Admin match queue: locked/paid/pickup_confirmed claims with donor contact.
export async function GET() {
  const store = db();
  const queue = store.claims
    .filter((c) => ["locked", "paid", "pickup_confirmed"].includes(c.status))
    .map((c) => {
      const listing = store.listings.find((l) => l.id === c.listingId);
      const donor = listing?.donorId ? store.users.find((u) => u.id === listing.donorId) : undefined;
      return {
        claim: c,
        listingId: c.listingId,
        listingTitle: listing?.title ?? "Item",
        // Registered donor's account phone, or the contact number left on a guest listing.
        donorPhone: donor?.phone ?? listing?.donorPhone ?? "no phone saved",
      };
    });
  return NextResponse.json({ queue });
}
