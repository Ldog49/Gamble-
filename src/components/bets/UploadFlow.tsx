"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SlipUploader from "./SlipUploader";
import BetConfirmForm, {
  betFormValuesFromExtraction,
  type BetFormValues,
} from "./BetConfirmForm";
import type { ParsedSlip } from "@/types";

type Step = "upload" | "parsing" | "confirm" | "saving";

interface BetPayload {
  slipImagePath: string;
  rawExtraction: ParsedSlip | null;
  betType: string;
  betTypeRaw: string | null;
  homeTeam: string;
  awayTeam: string;
  selection: string;
  odds: number;
  stake: number;
  potentialReturn: number;
}

export default function UploadFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("upload");
  const [slipImagePath, setSlipImagePath] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ParsedSlip | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function postBet(payload: BetPayload): Promise<boolean> {
    setStep("saving");
    setError(null);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not save bet");
      }
      await res.json();
      router.push("/bets/week");
      router.refresh();
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }

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

      const imagePath: string | undefined = data.slipImagePath;
      if (imagePath) setSlipImagePath(imagePath);

      if (res.ok && imagePath) {
        // Slip was read successfully — save it straight away, no manual
        // confirm step. If the save itself fails, fall back to the
        // editable form below (pre-filled) so nothing gets lost.
        const parsedExtraction = data.extraction as ParsedSlip;
        setExtraction(parsedExtraction);
        const saved = await postBet({
          slipImagePath: imagePath,
          rawExtraction: parsedExtraction,
          betType: parsedExtraction.betType,
          betTypeRaw: parsedExtraction.betTypeRaw,
          homeTeam: parsedExtraction.homeTeam,
          awayTeam: parsedExtraction.awayTeam,
          selection: parsedExtraction.selection,
          odds: parsedExtraction.odds,
          stake: parsedExtraction.stake,
          potentialReturn: parsedExtraction.potentialReturn,
        });
        if (!saved) setStep("confirm");
      } else {
        setParseWarning(data.error ?? "Could not automatically read the slip.");
        setStep("confirm");
      }
    } catch {
      setError("Upload failed. Check your connection and try again.");
      setStep("upload");
    }
  }

  async function handleManualSave(values: BetFormValues) {
    if (!slipImagePath) return;
    const saved = await postBet({
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
    });
    if (!saved) setStep("confirm");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Upload a bet slip</h1>

      {error && (
        <p className="rounded-lg bg-danger-subtle px-3 py-2 text-sm text-danger">{error}</p>
      )}

      {(step === "upload" || step === "parsing") && (
        <SlipUploader onFileSelected={handleFile} disabled={step === "parsing"} />
      )}
      {step === "parsing" && (
        <p className="text-center text-sm text-muted-foreground">Reading your slip…</p>
      )}
      {step === "saving" && (
        <p className="text-center text-sm text-muted-foreground">Saving bet…</p>
      )}

      {step === "confirm" && (
        <BetConfirmForm
          initialValues={betFormValuesFromExtraction(extraction)}
          parseWarning={parseWarning}
          notes={extraction?.notes ?? null}
          lowConfidence={extraction?.confidence === "low"}
          onSubmit={handleManualSave}
          submitting={false}
        />
      )}
    </div>
  );
}
