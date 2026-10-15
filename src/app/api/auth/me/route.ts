import { NextResponse } from "next/server";
import { db, publicUser } from "@/server/db";

function tokenOf(req: Request) {
  const h = req.headers.get("authorization") ?? "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export async function GET(req: Request) {
  const store = db();
  const tok = tokenOf(req);
  const userId = tok ? store.sessions[tok] : undefined;
  const user = userId ? store.users.find((u) => u.id === userId) : undefined;
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: publicUser(user) });
}
