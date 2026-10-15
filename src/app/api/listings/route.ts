import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { makeDeliveryCode, uid } from "@/lib/delivery";
import { CATEGORIES } from "@/lib/types";

const Schema = z.object({
  donorId: z.string().min(1),
  donorName: z.string().min(1),
  title: z.string().min(4),
  description: z.string().min(10),
  category: z.enum(CATEGORIES as unknown as [string, ...string[]]),
  location: z.string().min(2),
  originStory: z.string().min(4),
  photos: z.array(z.string()).default([]),
  selectionMethod: z.enum(["fcfs", "manual"]),
});

export async function GET(req: Request) {
  const store = db();
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  const cat = url.searchParams.get("category") ?? "All";
  const items = store.listings.filter((l) => {
    const okCat = cat === "All" || l.category === cat;
    const okQ = !q || `${l.title} ${l.description} ${l.location}`.toLowerCase().includes(q);
    return okCat && okQ;
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid listing payload" }, { status: 400 });
  const store = db();
  const item = {
    ...parsed.data,
    id: uid("listing"),
    status: "available" as const,
    deliveryCode: makeDeliveryCode(),
    createdAt: new Date().toISOString(),
  };
  store.listings.unshift(item);
  return NextResponse.json({ item }, { status: 201 });
}
