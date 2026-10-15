import { NextResponse } from "next/server";
import { z } from "zod";
import { db, publicUser } from "@/server/db";
import { uid } from "@/lib/delivery";

const Schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const store = db();
  const user = store.users.find(
    (u) => u.email === parsed.data.email.trim().toLowerCase() && u.password === parsed.data.password
  );
  if (!user) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  const token = uid("tok");
  store.sessions[token] = user.id;
  return NextResponse.json({ user: publicUser(user), token });
}
