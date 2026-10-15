import { NextResponse } from "next/server";
import { z } from "zod";
import { distanceToFee, formatNaira } from "@/lib/delivery";

const Schema = z.object({ distanceKm: z.number().min(0).max(200) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "distanceKm required (0-200)" }, { status: 400 });
  const fee = distanceToFee(parsed.data.distanceKm);
  return NextResponse.json({ distanceKm: parsed.data.distanceKm, fee, formatted: formatNaira(fee) });
}
