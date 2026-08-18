"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SlipUploader from "./SlipUploader";
import BetConfirmForm, { type BetFormValues } from "./BetConfirmForm";
import type { ParsedSlip } from "@/types";

type Step = "upload" | "parsing" | "confirm" | "saving";

export default function UploadFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [slipImagePath, setSlipImagePath] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ParsedSlip | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setStep("parsing");
    setError(null);
    setParseWarning(null);
    setExtraction(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/bets/parse", { method: "POST", body: formData });
      const data = await res.json();

      if (data.slipImagePath) setSlipImagePath(data.slipImagePath);

      if (res.ok) {
        setExtraction(data.extraction as ParsedSlip);
      } else {
        setParseWarning(data.error ?? "Could not automatically read the slip.");
      }
      setStep("confirm");
    } catch {
      setError("Upload failed. Check your connection and try again.");
      setStep("upload");
    }
  }

  async function handleSave(values: BetFormValues) {
    if (!slipImagePath) return;
    setStep("saving");
    setError(null);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slipImagePath,
          rawExtraction: extraction,
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
        throw new Error(data.error ?? "Could not save bet");
      }
      const bet = await res.json();
      router.push(bet.gameweek ? `/bets/week?gameweek=${bet.gameweek}` : "/bets/week");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setStep("confirm");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Upload a bet slip</h1>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}

      {(step === "upload" || step === "parsing") && (
        <SlipUploader onFileSelected={handleFile} disabled={step === "parsing"} />
      )}
      {step === "parsing" && (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Reading your slip…
        </p>
      )}

      {(step === "confirm" || step === "saving") && (
        <BetConfirmForm
          extraction={extraction}
          parseWarning={parseWarning}
          onSubmit={handleSave}
          submitting={step === "saving"}
        />
      )}
    </div>
  );
}
