type SourceMetaProps = {
  brand: string;
  sourceUrl: string;
  date: string;
  isLive: boolean;
  availableBrands: string[];
};

export function SourceMeta({
  brand,
  sourceUrl,
  date,
  isLive,
  availableBrands,
}: SourceMetaProps) {
  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-[var(--card)] px-4 py-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 text-sm text-[var(--muted)] xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-semibold uppercase tracking-[0.18em] text-[var(--muted-strong)]">
            {isLive ? "Live source" : brand}
          </span>
          <span>URL: {sourceUrl}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span>Date: {date}</span>
          {!isLive ? <span>Included: {availableBrands.join(" / ")}</span> : null}
        </div>
      </div>
    </div>
  );
}
