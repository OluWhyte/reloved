import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";

const Patch = z.object({
  action: z.enum(["choose", "pay", "confirm_pickup", "dispatch", "confirm_receipt"]),
});

// PATCH /api/claims/:id  { action }
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = Patch.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  const store = db();
  const claim = store.claims.find((c) => c.id === id);
  if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  const listing = store.listings.find((l) => l.id === claim.listingId);
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const action = parsed.data.action;
  if (action === "choose") {
    claim.isChosen = true;
    claim.status = "locked";
    listing.status = "locked";
    listing.lockedClaimId = claim.id;
    listing.lockedByName = claim.recipientName;
  } else if (action === "pay") {
    if (claim.deliveryMethod !== "courier") {
      return NextResponse.json({ error: "Only courier claims need payment" }, { status: 400 });
    }
    claim.status = "paid";
    listing.status = "locked";
    listing.lockedClaimId = claim.id;
    listing.lockedByName = claim.recipientName;
  } else if (action === "confirm_pickup") {
    claim.status = "pickup_confirmed";
    listing.status = "locked";
    listing.lockedClaimId = claim.id;
    listing.lockedByName = claim.recipientName;
  } else if (action === "dispatch") {
    claim.status = "in_transit";
    listing.status = "in_transit";
  } else if (action === "confirm_receipt") {
    claim.status = "delivered";
    listing.status = "delivered";
    // Step 4: +1 karma point to donor
    const donor = store.users.find((u) => u.id === listing.donorId);
    if (donor) donor.karmaPoints += 1;
  }
  return NextResponse.json({ claim, listing });
}
