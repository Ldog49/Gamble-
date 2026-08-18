"use client";

import { useState } from "react";
import { BET_STATUS_LABELS, BET_STATUSES, type BetDTO, type BetStatus } from "@/types";

const STATUS_STYLES: Record<BetStatus, string> = {
  PENDING: "bg-surface-secondary text-muted-foreground",
  NEEDS_REVIEW: "bg-warning-subtle text-warning",
  WON: "bg-success-subtle text-success",
  LOST: "bg-danger-subtle text-danger",
  PUSH: "bg-info-subtle text-info",
  VOID: "bg-surface-secondary text-muted-foreground",
};

function StatusIcon({ status }: { status: BetStatus }) {
  const common = { width: 12, height: 12, viewBox: "0 0 12 12", fill: "none", "aria-hidden": true };
  switch (status) {
    case "WON":
      return (
        <svg {...common}>
          <path d="M2.5 6.2 5 8.7 9.5 3.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "LOST":
      return (
        <svg {...common}>
          <path d="M3 3 9 9M9 3 3 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "NEEDS_REVIEW":
      return (
        <svg {...common}>
          <path d="M6 1.2 11 10.2H1L6 1.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M6 4.8V6.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="6" cy="8.6" r="0.6" fill="currentColor" />
        </svg>
      );
    case "PUSH":
      return (
        <svg {...common}>
          <path d="M2 4.5H10M2 7.5H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "VOID":
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="4.3" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3.3 3.3 8.7 8.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "PENDING":
    default:
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="4.3" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6 3.6V6l1.8 1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

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
        title={bet.manualOverride ? "Set manually" : undefined}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap transition disabled:opacity-60 ${STATUS_STYLES[bet.status]}`}
      >
        <StatusIcon status={bet.status} />
        {BET_STATUS_LABELS[bet.status]}
        {bet.manualOverride && (
          <span aria-hidden className="ml-0.5 size-1.5 rounded-full bg-current opacity-60" />
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-border bg-surface p-1 shadow-lg">
            {BET_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-brand-subtle"
              >
                <span className={STATUS_STYLES[s].split(" ")[1]}>
                  <StatusIcon status={s} />
                </span>
                {BET_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
