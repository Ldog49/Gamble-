"use client";

import { useState } from "react";
import { BET_TYPES, BET_TYPE_LABELS, type BetType, type ParsedSlip } from "@/types";
import { parseOddsInput } from "@/lib/odds";

export interface BetFormValues {
  betType: BetType;
  betTypeRaw: string;
  homeTeam: string;
  awayTeam: string;
  selection: string;
  odds: string;
  stake: string;
  potentialReturn: string;
}

export const BLANK_BET_FORM_VALUES: BetFormValues = {
  betType: "MATCH_RESULT",
  betTypeRaw: "",
  homeTeam: "",
  awayTeam: "",
  selection: "",
  odds: "",
  stake: "5",
  potentialReturn: "",
};

export function betFormValuesFromExtraction(extraction: ParsedSlip | null): BetFormValues {
  if (!extraction) return BLANK_BET_FORM_VALUES;
  return {
    betType: extraction.betType,
    betTypeRaw: extraction.betTypeRaw ?? "",
    homeTeam: extraction.homeTeam,
    awayTeam: extraction.awayTeam,
    selection: extraction.selection,
    odds: String(extraction.odds),
    stake: String(extraction.stake),
    potentialReturn: String(extraction.potentialReturn),
  };
}

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export default function BetConfirmForm({
  initialValues,
  parseWarning,
  notes,
  lowConfidence,
  onSubmit,
  onCancel,
  submitting,
  submitLabel = "Save bet",
}: {
  initialValues: BetFormValues;
  parseWarning?: string | null;
  notes?: string | null;
  lowConfidence?: boolean;
  onSubmit: (values: BetFormValues) => void;
  onCancel?: () => void;
  submitting: boolean;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<BetFormValues>(initialValues);
  const [oddsError, setOddsError] = useState<string | null>(null);

  function update<K extends keyof BetFormValues>(key: K, value: BetFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleOddsBlur() {
    const parsed = parseOddsInput(values.odds);
    if (parsed != null) {
      update("odds", String(parsed));
      setOddsError(null);
    } else if (values.odds.trim()) {
      setOddsError("Enter odds as a decimal (1.85) or fraction (6/4)");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedOdds = parseOddsInput(values.odds);
    if (parsedOdds == null) {
      setOddsError("Enter odds as a decimal (1.85) or fraction (6/4)");
      return;
    }
    onSubmit({ ...values, odds: String(parsedOdds) });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {parseWarning && (
        <p className="rounded-lg bg-warning-subtle px-3 py-2 text-sm text-warning">
          {parseWarning} Fill in the details below manually.
        </p>
      )}
      {notes && (
        <p className="rounded-lg bg-info-subtle px-3 py-2 text-sm text-info">
          Note from auto-read: {notes}
        </p>
      )}
      {lowConfidence && (
        <p className="rounded-lg bg-warning-subtle px-3 py-2 text-sm text-warning">
          Low confidence read — please double-check every field below.
        </p>
      )}

      <Field label="Bet type">
        <select
          value={values.betType}
          onChange={(e) => update("betType", e.target.value as BetType)}
          className={inputClass}
        >
          {BET_TYPES.map((t) => (
            <option key={t} value={t}>
              {BET_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Home team">
          <input
            value={values.homeTeam}
            onChange={(e) => update("homeTeam", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Away team">
          <input
            value={values.awayTeam}
            onChange={(e) => update("awayTeam", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Selection">
        <input
          value={values.selection}
          onChange={(e) => update("selection", e.target.value)}
          required
          placeholder="e.g. Arsenal to win"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Odds">
          <input
            type="text"
            inputMode="text"
            placeholder="1.85 or 6/4"
            value={values.odds}
            onChange={(e) => {
              update("odds", e.target.value);
              if (oddsError) setOddsError(null);
            }}
            onBlur={handleOddsBlur}
            required
            className={inputClass}
          />
          {oddsError && <span className="text-xs text-danger">{oddsError}</span>}
        </Field>
        <Field label="Stake (£)">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={values.stake}
            onChange={(e) => update("stake", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Return (£)">
          <input
            type="number"
            step="0.01"
            min="0"
            value={values.potentialReturn}
            onChange={(e) => update("potentialReturn", e.target.value)}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-2 flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium transition hover:bg-surface-secondary"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-brand px-4 py-3 text-sm font-medium text-brand-foreground transition hover:bg-brand-strong disabled:opacity-50"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
