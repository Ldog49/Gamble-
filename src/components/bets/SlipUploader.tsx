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
          className="max-h-64 w-full rounded-xl border border-zinc-200 object-contain dark:border-zinc-800"
        />
      ) : (
        <div className="flex h-40 w-full items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
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
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
      >
        {previewUrl ? "Choose a different photo" : "Upload a screenshot or photo"}
      </button>
    </div>
  );
}
