import { NextResponse } from "next/server";
import { z } from "zod";
import { db, publicUser } from "@/server/db";
import { uid } from "@/lib/delivery";

const Schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup payload" }, { status: 400 });
  }
  const store = db();
  const email = parsed.data.email.trim().toLowerCase();
  if (store.users.some((u) => u.email === email)) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
  const user = {
    id: uid("user"),
    name: parsed.data.name.trim(),
    email,
    password: parsed.data.password,
    phone: parsed.data.phone?.trim() || undefined,
    karmaPoints: 0,
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  const token = uid("tok");
  store.sessions[token] = user.id;
  return NextResponse.json({ user: publicUser(user), token });
}
