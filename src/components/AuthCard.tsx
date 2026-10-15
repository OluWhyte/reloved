"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-api";

export function AuthCard({
  mode,
}: {
  mode: "signup" | "signin";
}) {
  const { signup, signin } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const msg =
      mode === "signup"
        ? await signup(name, email, password, phone)
        : await signin(email, password);
    setBusy(false);
    if (msg) {
      setErr(msg);
      return;
    }
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card space-y-4 p-6 sm:p-8">
        <h1 className="text-2xl font-black">
          {mode === "signup" ? "Create your Reloved account" : "Welcome back"}
        </h1>
        <p className="text-sm text-stone-500">
          {mode === "signup"
            ? "Sign up to list items, claim what you need, and earn karma points."
            : "Sign in to manage listings, claims and your karma points."}
        </p>
        {err && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {err}
          </div>
        )}
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              className="input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            placeholder="Password (min 6 chars)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "signup" && (
            <input
              className="input"
              placeholder="Phone / WhatsApp (for admin pickup calls)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}
          <button className="btn-primary w-full" type="submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Sign up free" : "Sign in"}
          </button>
        </form>
        <p className="text-center text-sm text-stone-500">
          {mode === "signup" ? (
            <>
              Have an account?{" "}
              <Link href="/signin" className="font-semibold text-emerald-700 underline">
                Sign in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="font-semibold text-emerald-700 underline">
                Create account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
