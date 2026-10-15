import type { Metadata } from "next";
import Link from "next/link";
import { AuthProvider } from "@/lib/auth-api";
import { BRAND_NAME } from "@/lib/brand";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Give What You Don't Need`,
  description:
    "List pre-loved items, claim what you need, earn karma points, share thank-you stories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6">
            {children}
          </main>
          <footer className="border-t border-stone-200 bg-white py-8 text-center text-sm text-stone-500">
            <nav className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-base font-semibold text-stone-700">
              <Link href="/impact">Impact Wall</Link>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/admin">Admin</Link>
              <Link href="/donate">Donate</Link>
            </nav>
            {BRAND_NAME} — zero delivery cost to donors. Recipients cover courier or pick up free at Safe Spots.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
