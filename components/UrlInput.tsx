"use client";

import { useState } from "react";

type UrlInputProps = {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export function UrlInput({ onSubmit, isLoading, error }: UrlInputProps) {
  const [value, setValue] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(value);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="url"
            inputMode="url"
            placeholder="Paste a Terms of Service URL..."
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="h-9 flex-1 border border-[var(--line)] bg-white px-3 text-[15px] outline-none transition placeholder:text-[#8c8478] focus:border-[var(--ink)]"
            aria-label="Terms URL"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-9 items-center justify-center self-start bg-[var(--ink)] px-4 text-[15px] font-medium text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-72"
          >
            {isLoading ? "Analyzing" : "Analyze"}
          </button>
      </div>
      {error ? (
        <p className="text-sm leading-6 text-[var(--risk-very-text)]">{error}</p>
      ) : null}
    </form>
  );
}
