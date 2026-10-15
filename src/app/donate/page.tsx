import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

// Placeholder: public money-support page. Payment options (bank/card/USSD) get added here later.
export default function DonatePage() {
  return (
    <div className="mx-auto max-w-xl">
      <div className="card space-y-4 p-6 text-center sm:p-8">
        <div className="text-4xl">💛</div>
        <h1 className="break-words text-2xl font-black">Support {BRAND_NAME}</h1>
        <p className="text-sm text-stone-600">
          Give to help us keep listing free for donors and cover platform running costs.
          Every gift keeps items moving from people who have too much to people who need them.
        </p>
        <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-4 text-sm font-semibold text-stone-500">
          Payment options coming soon — bank transfer, card &amp; USSD will be listed here.
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-ghost">Back home</Link>
          <Link href="/list" className="btn-primary">List an item instead</Link>
        </div>
      </div>
    </div>
  );
}