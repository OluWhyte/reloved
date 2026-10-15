"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-api";

export default function Navbar() {
  const { user, signout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-lg font-black text-white">
            R
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Reloved
            <span className="ml-2 hidden rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 sm:inline">
              give · claim · thank
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/" className="rounded-lg px-3 py-2 hover:bg-stone-100">
            Browse
          </Link>
          <Link href="/impact" className="rounded-lg px-3 py-2 hover:bg-stone-100">
            Impact Wall
          </Link>
          <Link
            href="/list"
            className="rounded-lg bg-stone-900 px-3 py-2 text-white hover:bg-stone-700"
          >
            + List item
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="rounded-lg px-3 py-2 hover:bg-stone-100">
                Dashboard
              </Link>
              <Link href="/admin" className="rounded-lg px-3 py-2 hover:bg-stone-100">
                Admin
              </Link>
              <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 sm:inline">
                {user.karmaPoints} karma
              </span>
              <button
                onClick={signout}
                className="rounded-lg border border-stone-200 px-3 py-2 hover:bg-stone-100"
                title={user.email}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-lg border border-stone-200 px-3 py-2 hover:bg-stone-100"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500"
              >
                Sign up free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
