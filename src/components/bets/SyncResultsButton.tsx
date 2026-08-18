"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncResultsButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function sync() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/fixtures/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Sync failed");
      } else {
        setMessage(
          `Synced ${data.fixturesUpdated} fixtures, graded ${data.betsGraded} bets${
            data.betsNeedingReview ? `, ${data.betsNeedingReview} need review` : ""
          }.`
        );
        router.refresh();
      }
    } catch {
      setMessage("Sync failed — check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={sync}
        disabled={busy}
        className="rounded-lg border border-brand px-3 py-1.5 text-sm font-medium whitespace-nowrap text-brand-text transition hover:bg-brand-subtle disabled:opacity-50"
      >
        {busy ? "Syncing…" : "Sync results"}
      </button>
      {message && (
        <p className="max-w-[220px] text-right text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
