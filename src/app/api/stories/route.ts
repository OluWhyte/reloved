import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/server/db";
import { uid } from "@/lib/delivery";

const Schema = z.object({
  listingId: z.string().default("manual"),
  listingTitle: z.string().min(2),
  donorName: z.string().default("Reloved donor"),
  recipientName: z.string().min(1),
  note: z.string().min(4),
  photo: z.string().default(""),
});

export async function GET() {
  return NextResponse.json({ stories: db().stories });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid story payload" }, { status: 400 });
  const story = { ...parsed.data, id: uid("story"), createdAt: new Date().toISOString() };
  db().stories.unshift(story);
  return NextResponse.json({ story }, { status: 201 });
}
