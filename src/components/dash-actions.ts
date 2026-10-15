"use client";
import { api } from "@/lib/api";
import type { Claim } from "@/lib/types";

// Dashboard claim actions — all state changes go through the claims API.
export function useDashboardActions(rerender: () => void) {
  const run = async (c: Claim, action: "pay" | "confirm_pickup" | "confirm_receipt") => {
    try {
      await api.claimAction(c.id, action);
    } catch {
      // ignore — UI stays consistent with last known state
    }
    rerender();
  };
  const payFee = (claim: Claim) => run(claim, "pay");
  const confirmPickup = (claim: Claim) => run(claim, "confirm_pickup");
  const confirmReceipt = (claim: Claim) => run(claim, "confirm_receipt");
  return { payFee, confirmPickup, confirmReceipt };
}
