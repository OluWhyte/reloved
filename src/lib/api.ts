// Typed client for the Reloved REST API (/api/*).
// Auth uses a Bearer token stored in localStorage (demo mode).
import type { Claim, Listing, ThankStory } from "./types";

const TOKEN_KEY = "reloved.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const tok = getToken();
  if (tok) headers.Authorization = `Bearer ${tok}`;
  const res = await fetch(path, { ...init, headers: { ...headers, ...(init?.headers as object) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed: ${path}`);
  return data as T;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  karmaPoints: number;
  createdAt: string;
}

export const api = {
  health: () => req<{ ok: boolean }>("/api/health"),
  signup: (p: { name: string; email: string; password: string; phone?: string }) =>
    req<{ user: PublicUser; token: string }>("/api/auth/signup", { method: "POST", body: JSON.stringify(p) }),
  signin: (p: { email: string; password: string }) =>
    req<{ user: PublicUser; token: string }>("/api/auth/signin", { method: "POST", body: JSON.stringify(p) }),
  me: () => req<{ user: PublicUser }>("/api/auth/me"),
  listings: (q?: string, category?: string) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category && category !== "All") sp.set("category", category);
    const s = sp.toString();
    return req<{ items: Listing[] }>(`/api/listings${s ? `?${s}` : ""}`);
  },
  createListing: (p: Omit<Listing, "id" | "status" | "deliveryCode" | "createdAt">) =>
    req<{ item: Listing }>("/api/listings", { method: "POST", body: JSON.stringify(p) }),
  listing: (id: string) => req<{ item: Listing }>(`/api/listings/${id}`),
  quote: (distanceKm: number) =>
    req<{ distanceKm: number; fee: number; formatted: string }>("/api/delivery/quote", {
      method: "POST",
      body: JSON.stringify({ distanceKm }),
    }),
  claims: (params?: { listingId?: string; recipientId?: string; status?: string }) => {
    const sp = new URLSearchParams();
    if (params?.listingId) sp.set("listingId", params.listingId);
    if (params?.recipientId) sp.set("recipientId", params.recipientId);
    if (params?.status) sp.set("status", params.status);
    const s = sp.toString();
    return req<{ claims: Claim[] }>(`/api/claims${s ? `?${s}` : ""}`);
  },
  createClaim: (p: { listingId: string; recipientId: string; recipientName: string; deliveryMethod: "pickup" | "courier"; distanceKm: number }) =>
    req<{ claim: Claim; listing: Listing }>("/api/claims", { method: "POST", body: JSON.stringify(p) }),
  claimAction: (id: string, action: "choose" | "pay" | "confirm_pickup" | "dispatch" | "confirm_receipt") =>
    req<{ claim: Claim; listing: Listing }>(`/api/claims/${id}`, { method: "PATCH", body: JSON.stringify({ action }) }),
  stories: () => req<{ stories: ThankStory[] }>("/api/stories"),
  adminQueue: () =>
    req<{
      queue: {
        claim: Claim;
        listingId: string;
        listingTitle: string;
        donorPhone: string;
      }[];
    }>("/api/admin/queue"),
  createStory: (p: { listingTitle: string; recipientName: string; note: string; listingId?: string; donorName?: string }) =>
    req<{ story: ThankStory }>("/api/stories", { method: "POST", body: JSON.stringify(p) }),
};
