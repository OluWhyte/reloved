export function distanceToFee(km: number): number {
  if (km <= 3) return 1200;
  if (km <= 7) return 2000;
  if (km <= 15) return 3200;
  if (km <= 30) return 5000;
  return 5000 + Math.round((km - 30) * 150);
}

export function formatNaira(n: number): string {
  return "₦" + n.toLocaleString("en-NG");
}

export function makeDeliveryCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}
