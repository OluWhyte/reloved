import { NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const item = db().listings.find((l) => l.id === id);
  if (!item) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  return NextResponse.json({ item });
}
