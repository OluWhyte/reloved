"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-api";
import { BRAND_NAME } from "@/lib/brand";

// Exactly four menu items: logo · Donate · List item · Sign up (Sign out when authed).
export default function Navbar() {
  const { user, signout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label={`${BRAND_NAME} home`}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-900 text-lg font-black text-white">
            R
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            {BRAND_NAME}
            <span className="ml-2 hidden rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-600 sm:inline">
              give · claim · thank
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/donate" className="rounded-none px-3 py-2 hover:bg-stone-100">
            Donate
          </Link>
          <Link
            href="/list"
            className="rounded-none bg-stone-900 px-3 py-2 text-white hover:bg-stone-700"
          >
            List item
          </Link>
          {user ? (
            <button
              onClick={signout}
              className="rounded-none border border-stone-300 px-3 py-2 hover:bg-stone-100"
              title={user.email}
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/signup"
              className="rounded-none border border-stone-300 px-3 py-2 hover:bg-stone-100"
            >
              Sign up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
