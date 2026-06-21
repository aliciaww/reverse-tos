import type { AgreementCard } from "@/types";

type AgreementBulletsProps = {
  items: AgreementCard[];
};

export function AgreementBullets({ items }: AgreementBulletsProps) {
  return (
    <section className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
        What you&apos;re agreeing to
      </p>
      <div className="mt-4 grid gap-0 border border-[var(--line)] bg-white sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={`${item.label}-${item.detail}`}
            className="min-h-[108px] border-b border-[var(--line)] p-4 sm:border-r [&:nth-last-child(-n+2)]:sm:border-b-0 [&:nth-child(2n)]:sm:border-r-0 last:border-b-0"
          >
            <h3 className="text-[15px] font-semibold leading-5 text-[var(--ink)]">{item.label}</h3>
            <p className="mt-2 text-[15px] leading-6 text-[var(--muted)]">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
