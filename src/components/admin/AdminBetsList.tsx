"use client";

import { useState } from "react";
import { BET_TYPE_LABELS, type BetDTO } from "@/types";
import BetConfirmForm, { type BetFormValues } from "@/components/bets/BetConfirmForm";
import ResultBadge from "@/components/bets/ResultBadge";
import { formatMoney, profitClass } from "@/lib/format";

function betFormValuesFromBet(bet: BetDTO): BetFormValues {
  return {
    betType: bet.betType,
    betTypeRaw: bet.betTypeRaw ?? "",
    homeTeam: bet.homeTeam,
    awayTeam: bet.awayTeam,
    selection: bet.selection,
    odds: String(bet.odds),
    stake: String(bet.stake),
    potentialReturn: String(bet.potentialReturn),
  };
}

export default function AdminBetsList({ bets: initialBets }: { bets: BetDTO[] }) {
  const [bets, setBets] = useState(initialBets);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleBetUpdated(updated: BetDTO) {
    setBets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  async function handleSaveEdit(betId: string, values: BetFormValues) {
    setSavingId(betId);
    setError(null);
    try {
      const res = await fetch(`/api/bets/${betId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          betType: values.betType,
          betTypeRaw: values.betTypeRaw || null,
          homeTeam: values.homeTeam,
          awayTeam: values.awayTeam,
          selection: values.selection,
          odds: Number(values.odds),
          stake: Number(values.stake),
          potentialReturn: Number(values.potentialReturn),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not save changes");
      }
      const patched = (await res.json()) as BetDTO;

      // Corrected team names might now resolve to a fixture that didn't
      // match before — re-run grading immediately so the fix takes effect
      // straight away rather than waiting for the next sync.
      const gradeRes = await fetch(`/api/bets/${betId}/grade`, { method: "POST" });
      const finalBet = gradeRes.ok ? ((await gradeRes.json()) as BetDTO) : patched;

      handleBetUpdated(finalBet);
      setEditingId(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(betId: string) {
    setSavingId(betId);
    setError(null);
    try {
      const res = await fetch(`/api/bets/${betId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete bet");
      setBets((prev) => prev.filter((b) => b.id !== betId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingId(null);
      setConfirmingDeleteId(null);
    }
  }

  if (bets.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No bets yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger">{error}</p>
      )}
      {bets.map((bet) => (
        <div key={bet.id} className="rounded-xl border border-border bg-surface p-3">
          {editingId === bet.id ? (
            <BetConfirmForm
              initialValues={betFormValuesFromBet(bet)}
              onSubmit={(values) => handleSaveEdit(bet.id, values)}
              onCancel={() => setEditingId(null)}
              submitting={savingId === bet.id}
              submitLabel="Save changes"
            />
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-muted-foreground">
                    GW {bet.gameweek ?? "—"} · {bet.userName}
                  </div>
                  <div className="font-medium">
                    {bet.homeTeam} v {bet.awayTeam}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {bet.selection} · {BET_TYPE_LABELS[bet.betType]}
                  </div>
                </div>
                <ResultBadge bet={bet} onChanged={handleBetUpdated} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Odds {bet.odds.toFixed(2)} · Stake £{bet.stake.toFixed(2)}
                </span>
                <span className={`font-medium ${profitClass(bet.profit)}`}>
                  {formatMoney(bet.profit)}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setEditingId(bet.id)}
                  className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition hover:bg-surface-secondary"
                >
                  Edit
                </button>
                {confirmingDeleteId === bet.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(bet.id)}
                      disabled={savingId === bet.id}
                      className="flex-1 rounded-lg border border-danger/40 bg-danger-subtle px-3 py-1.5 text-sm font-medium text-danger disabled:opacity-50"
                    >
                      Confirm delete
                    </button>
                    <button
                      onClick={() => setConfirmingDeleteId(null)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmingDeleteId(bet.id)}
                    className="rounded-lg border border-danger/40 px-3 py-1.5 text-sm font-medium text-danger transition hover:bg-danger-subtle"
                  >
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
