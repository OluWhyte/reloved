import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { distanceToFee, uid } from "@/lib/delivery";
import type { Claim } from "@/lib/types";

const Quote = z.object({ distanceKm: z.number().min(0).max(200) });
const CreateClaim = z.object({
  listingId: z.string().min(1),
  recipientId: z.string().min(1),
  recipientName: z.string().min(1),
  deliveryMethod: z.enum(["pickup", "courier"]),
  distanceKm: z.number().min(0).max(200).default(5),
});

export async function GET(req: Request) {
  const store = db();
  const url = new URL(req.url);
  const listingId = url.searchParams.get("listingId");
  const recipientId = url.searchParams.get("recipientId");
  const status = url.searchParams.get("status");
  const items = store.claims.filter((c) => {
    if (listingId && c.listingId !== listingId) return false;
    if (recipientId && c.recipientId !== recipientId) return false;
    if (status && c.status !== status) return false;
    return true;
  });
  return NextResponse.json({ claims: items });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  // POST /api/claims/quote -> fee estimate without creating a claim
  if (url.pathname.endsWith("/quote")) {
    const body = await req.json().catch(() => null);
    const parsed = Quote.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid quote payload" }, { status: 400 });
    return NextResponse.json({ distanceKm: parsed.data.distanceKm, fee: distanceToFee(parsed.data.distanceKm) });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateClaim.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid claim payload" }, { status: 400 });
  const store = db();
  const listing = store.listings.find((l) => l.id === parsed.data.listingId);
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.donorId === parsed.data.recipientId) {
    return NextResponse.json({ error: "You cannot claim your own listing" }, { status: 400 });
  }
  if (store.claims.some((c) => c.listingId === listing.id && c.recipientId === parsed.data.recipientId)) {
    return NextResponse.json({ error: "Already applied for this item" }, { status: 409 });
  }
  const fee = parsed.data.deliveryMethod === "courier" ? distanceToFee(parsed.data.distanceKm) : 0;
  const claim: Claim = {
    id: uid("claim"),
    listingId: listing.id,
    recipientId: parsed.data.recipientId,
    recipientName: parsed.data.recipientName,
    deliveryMethod: parsed.data.deliveryMethod,
    fee,
    distanceKm: parsed.data.distanceKm,
    status: "pending",
    isChosen: false,
    createdAt: new Date().toISOString(),
  };
  // Step 1 rule: FCFS auto-locks first applicant
  if (listing.selectionMethod === "fcfs" && listing.status === "available") {
    claim.status = "locked";
    claim.isChosen = true;
    listing.status = "locked";
    listing.lockedClaimId = claim.id;
    listing.lockedByName = claim.recipientName;
  }
  store.claims.push(claim);
  return NextResponse.json({ claim, listing }, { status: 201 });
}
