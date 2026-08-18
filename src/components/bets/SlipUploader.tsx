"use client";

import { useRef, useState } from "react";

export default function SlipUploader({
  onFileSelected,
  disabled,
}: {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- local blob preview, next/image can't load it
        <img
          src={previewUrl}
          alt="Bet slip preview"
          className="max-h-64 w-full rounded-xl border border-border object-contain"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground">
          No photo yet
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-medium text-brand-foreground transition hover:bg-brand-strong disabled:opacity-50"
      >
        {previewUrl ? "Choose a different photo" : "Upload a screenshot or photo"}
      </button>
    </div>
  );
}
