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
    <section className="rounded-[28px] border border-[var(--line)] bg-[var(--card)] p-3 shadow-[var(--shadow-soft)]">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
            Live URL
          </p>
          <p className="text-xs text-[var(--muted)]">Fetch and summarize on demand</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            inputMode="url"
            placeholder="https://company.com/terms"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="h-12 flex-1 rounded-full border border-[var(--line)] bg-white px-4 text-sm outline-none transition placeholder:text-[#8c8478] focus:border-[var(--ink)]"
            aria-label="Terms URL"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--ink)] px-5 text-sm font-semibold text-white transition hover:bg-[#2d2822] disabled:cursor-wait disabled:opacity-72"
          >
            {isLoading ? "Analyzing..." : "Load"}
          </button>
        </div>
        {error ? (
          <p className="rounded-2xl border border-[#d9b4ac] bg-[#f8e6e1] px-3 py-2 text-sm text-[var(--risk-very-text)]">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
