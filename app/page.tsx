"use client";

import { useState } from "react";
import instagramData from "@/data/instagram.json";
import tiktokData from "@/data/tiktok.json";
import discordData from "@/data/discord.json";
import xData from "@/data/x.json";
import { AgreementBullets } from "@/components/AgreementBullets";
import { BrandSelector } from "@/components/BrandSelector";
import { RedFlagsList } from "@/components/RedFlagsList";
import { TosViewer } from "@/components/TosViewer";
import { UrlInput } from "@/components/UrlInput";
import { VerdictCard } from "@/components/VerdictCard";
import type { BrandTosData, TosSummary } from "@/types";

const allowedRiskLevels = new Set([
  "Low risk",
  "Annoying",
  "Concerning",
  "Very one-sided",
]);

function parseBrandData(raw: unknown): BrandTosData {
  const candidate = raw as Partial<BrandTosData>;

  if (
    !candidate ||
    typeof candidate.brand !== "string" ||
    (candidate.logo !== null && typeof candidate.logo !== "string") ||
    typeof candidate.sourceUrl !== "string" ||
    typeof candidate.date !== "string" ||
    typeof candidate.text !== "string" ||
    !candidate.cachedSummary ||
    typeof candidate.cachedSummary.verdict !== "string" ||
    !allowedRiskLevels.has(candidate.cachedSummary.riskLevel) ||
    !Array.isArray(candidate.cachedSummary.agreementCards) ||
    !Array.isArray(candidate.cachedSummary.redFlags)
  ) {
    throw new Error("A local brand data file is malformed.");
  }

  return candidate as BrandTosData;
}

const preloadedBrands: BrandTosData[] = [instagramData, tiktokData, discordData, xData].map(
  parseBrandData,
);

type AnalysisState = {
  summary: TosSummary | null;
  text: string;
  sourceUrl: string;
  fetchedAt: string;
};

export default function Home() {
  const [selectedBrand, setSelectedBrand] = useState<BrandTosData>(preloadedBrands[0]);
  const [liveAnalysis, setLiveAnalysis] = useState<AnalysisState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const activeSource = liveAnalysis
    ? {
        brand: "Live URL",
        sourceUrl: liveAnalysis.sourceUrl,
        date: liveAnalysis.fetchedAt,
        text: liveAnalysis.text,
        summary: liveAnalysis.summary,
        logo: null,
      }
    : {
        brand: selectedBrand.brand,
        sourceUrl: selectedBrand.sourceUrl,
        date: selectedBrand.date,
        text: selectedBrand.text,
        summary: selectedBrand.cachedSummary,
        logo: selectedBrand.logo,
      };

  async function handleAnalyzeUrl(rawUrl: string) {
    const trimmedUrl = rawUrl.trim();

    if (!trimmedUrl) {
      setInlineError("Enter a terms URL to analyze.");
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      setInlineError("Enter a valid full URL, including https://");
      return;
    }

    setIsLoading(true);
    setInlineError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: parsedUrl.toString() }),
      });

      const rawBody = await response.text();
      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        throw new Error("The analyzer returned an unexpected response. Try again.");
      }

      const payload = JSON.parse(rawBody) as
        | {
            sourceUrl?: string;
            fetchedAt?: string;
            text?: string;
            summary?: TosSummary;
            error?: string;
          }
        | undefined;

      if (!response.ok || !payload?.summary || !payload.text || !payload.sourceUrl || !payload.fetchedAt) {
        throw new Error(payload?.error ?? "Could not analyze that page.");
      }

      setLiveAnalysis({
        summary: payload.summary,
        text: payload.text,
        sourceUrl: payload.sourceUrl,
        fetchedAt: payload.fetchedAt,
      });
    } catch (error) {
      setInlineError(
        error instanceof Error
          ? error.message
          : "Could not fetch or summarize that page.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectBrand(brandName: string) {
    const nextBrand = preloadedBrands.find((brand) => brand.brand === brandName);

    if (!nextBrand) {
      setInlineError("That source is unavailable right now.");
      return;
    }

    setSelectedBrand(nextBrand);
    setLiveAnalysis(null);
    setInlineError(null);
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4">
          <h1 className="text-[15px] font-semibold uppercase tracking-[0.22em]">Reverse TOS</h1>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px]">
        <div className="grid md:grid-cols-[minmax(0,1fr)_46%]">
          <section className="min-w-0 border-b border-[var(--line)] px-5 py-5 md:min-h-screen md:border-r md:border-b-0 md:py-6">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
                Select a platform
              </h2>
              <div className="mt-4">
                <BrandSelector
                  brands={preloadedBrands}
                  selectedBrand={liveAnalysis ? null : selectedBrand.brand}
                  onSelect={handleSelectBrand}
                />
              </div>
              <div className="mt-4">
                <UrlInput
                  onSubmit={handleAnalyzeUrl}
                  isLoading={isLoading}
                  error={inlineError}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-y border-[var(--line)] py-3">
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                <span>Source text</span>
                <span>—</span>
                <span>{activeSource.brand}</span>
              </div>
              <p className="text-[13px] text-[var(--muted)]">
                {liveAnalysis ? activeSource.sourceUrl.replace(/^https?:\/\//, "") : activeSource.date}
              </p>
            </div>

            <div className="mt-4 min-h-[560px]">
              <TosViewer text={activeSource.text} />
            </div>
          </section>

          <aside className="min-w-0 px-5 py-6">
            {activeSource.summary ? (
              <div>
                <VerdictCard
                  verdict={activeSource.summary.verdict}
                  riskLevel={activeSource.summary.riskLevel}
                />
                <AgreementBullets items={activeSource.summary.agreementCards} />
                <RedFlagsList items={activeSource.summary.redFlags} />
              </div>
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                No summary is available for this source yet.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
