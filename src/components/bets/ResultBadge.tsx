"use client";

import { useState } from "react";
import { BET_STATUS_LABELS, BET_STATUSES, type BetDTO, type BetStatus } from "@/types";

const STATUS_STYLES: Record<BetStatus, string> = {
  PENDING: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  NEEDS_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  WON: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  LOST: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  PUSH: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  VOID: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function ResultBadge({
  bet,
  onChanged,
}: {
  bet: BetDTO;
  onChanged: (bet: BetDTO) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  async function setStatus(newStatus: BetStatus) {
    setOpen(false);
    if (newStatus === bet.status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bets/${bet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = (await res.json()) as BetDTO;
        onChanged(updated);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        className={`rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[bet.status]}`}
      >
        {BET_STATUS_LABELS[bet.status]}
        {bet.manualOverride && " ✓"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            {BET_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {BET_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
