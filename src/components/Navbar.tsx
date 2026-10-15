"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-api";
import { BRAND_NAME } from "@/lib/brand";

// Exactly four menu items: logo · Donate · List item · Sign up (Sign out when authed).
export default function Navbar() {
  const { user, signout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        <Link href="/" className="flex min-w-0 items-center gap-1.5 sm:gap-2" aria-label={`${BRAND_NAME} home`}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-stone-900 text-base font-black text-white sm:h-9 sm:w-9 sm:text-lg">
            R
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight sm:text-xl">
            {BRAND_NAME}
            <span className="ml-2 hidden rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-600 lg:inline">
              give · claim · thank
            </span>
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-1 text-[13px] font-medium sm:gap-2 sm:text-sm">
          <Link href="/donate" className="whitespace-nowrap rounded-none px-2 py-1.5 hover:bg-stone-100 sm:px-3 sm:py-2">
            Donate
          </Link>
          <Link
            href="/list"
            className="whitespace-nowrap rounded-none bg-stone-900 px-2 py-1.5 text-white hover:bg-stone-700 sm:px-3 sm:py-2"
          >
            List item
          </Link>
          {user ? (
            <button
              onClick={signout}
              className="whitespace-nowrap rounded-none border border-stone-300 px-2 py-1.5 hover:bg-stone-100 sm:px-3 sm:py-2"
              title={user.email}
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/signup"
              className="whitespace-nowrap rounded-none border border-stone-300 px-2 py-1.5 hover:bg-stone-100 sm:px-3 sm:py-2"
            >
              Sign up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
