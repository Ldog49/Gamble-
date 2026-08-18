"use client";

import { useState } from "react";
import { BET_TYPES, BET_TYPE_LABELS, type BetType, type ParsedSlip } from "@/types";

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

function defaultsFromExtraction(extraction: ParsedSlip | null): BetFormValues {
  if (!extraction) {
    return {
      betType: "MATCH_RESULT",
      betTypeRaw: "",
      homeTeam: "",
      awayTeam: "",
      selection: "",
      odds: "",
      stake: "5",
      potentialReturn: "",
    };
  }
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
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

export default function BetConfirmForm({
  extraction,
  parseWarning,
  onSubmit,
  submitting,
}: {
  extraction: ParsedSlip | null;
  parseWarning?: string | null;
  onSubmit: (values: BetFormValues) => void;
  submitting: boolean;
}) {
  const [values, setValues] = useState<BetFormValues>(() => defaultsFromExtraction(extraction));

  function update<K extends keyof BetFormValues>(key: K, value: BetFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {parseWarning && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {parseWarning} Fill in the details below manually.
        </p>
      )}
      {extraction?.notes && (
        <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:bg-sky-950 dark:text-sky-300">
          Note from auto-read: {extraction.notes}
        </p>
      )}
      {extraction?.confidence === "low" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
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
            type="number"
            step="0.01"
            min="1"
            value={values.odds}
            onChange={(e) => update("odds", e.target.value)}
            required
            className={inputClass}
          />
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

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save bet"}
      </button>
    </form>
  );
}
