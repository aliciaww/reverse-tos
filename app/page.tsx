"use client";

import { useMemo, useState } from "react";
import instagramData from "@/data/instagram.json";
import tiktokData from "@/data/tiktok.json";
import discordData from "@/data/discord.json";
import xData from "@/data/x.json";
import { AgreementBullets } from "@/components/AgreementBullets";
import { BrandSelector } from "@/components/BrandSelector";
import { RedFlagsList } from "@/components/RedFlagsList";
import { SourceMeta } from "@/components/SourceMeta";
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
    !Array.isArray(candidate.cachedSummary.whatYouAgreeTo) ||
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

  const brandNames = useMemo(
    () => preloadedBrands.map((brand) => brand.brand),
    [],
  );

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

      const payload = (await response.json()) as
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
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <section className="flex min-h-screen flex-1 flex-col border-b border-[var(--line)] px-5 py-5 sm:px-7 sm:py-7 lg:border-r lg:border-b-0 lg:px-8 lg:py-8">
          <header className="mb-6 space-y-2 border-b border-[var(--line)] pb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-strong)]">
              Reverse TOS
            </p>
            <h1 className="max-w-xl font-serif text-4xl leading-none sm:text-5xl">
              Reverse TOS
            </h1>
            <p className="max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
              Terms of service, rewritten from the user&apos;s perspective.
            </p>
          </header>

          <div className="space-y-4">
            <BrandSelector
              brands={preloadedBrands}
              selectedBrand={liveAnalysis ? null : selectedBrand.brand}
              onSelect={handleSelectBrand}
            />
            <UrlInput
              onSubmit={handleAnalyzeUrl}
              isLoading={isLoading}
              error={inlineError}
            />
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <SourceMeta
              brand={activeSource.brand}
              sourceUrl={activeSource.sourceUrl}
              date={activeSource.date}
              isLive={Boolean(liveAnalysis)}
              availableBrands={brandNames}
            />
            <div className="mt-4 min-h-0 flex-1">
              <TosViewer text={activeSource.text} />
            </div>
          </div>
        </section>

        <aside className="flex min-h-screen w-full flex-col bg-[var(--paper-soft)] px-5 py-5 sm:px-7 sm:py-7 lg:w-[44%] lg:min-w-[480px] lg:px-8 lg:py-8">
          {activeSource.summary ? (
            <div className="flex h-full flex-col">
              <VerdictCard
                verdict={activeSource.summary.verdict}
                riskLevel={activeSource.summary.riskLevel}
              />
              <AgreementBullets items={activeSource.summary.whatYouAgreeTo} />
              <RedFlagsList items={activeSource.summary.redFlags} />
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[var(--line-strong)] bg-white/70 p-8 text-sm leading-7 text-[var(--muted)]">
              No summary available for this source yet.
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
