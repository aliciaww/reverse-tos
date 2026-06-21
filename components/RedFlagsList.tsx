import type { RedFlag } from "@/types";

type RedFlagsListProps = {
  items: RedFlag[];
};

export function RedFlagsList({ items }: RedFlagsListProps) {
  return (
    <section className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
        Red Flags
      </p>
      <div className="mt-4 border border-[var(--line)] bg-white">
        {items.slice(0, 3).map((item, index) => (
          <article
            key={`${item.title}-${item.clause}`}
            className={`flex gap-3 px-4 py-4 ${index < 2 ? "border-b border-[var(--line)]" : ""}`}
          >
            <span className="mt-[5px] text-[11px] text-[var(--accent)]">▲</span>
            <div>
              <h3 className="text-[15px] font-semibold leading-5">{item.title}</h3>
              <p className="mt-1 text-[14px] leading-6 text-[var(--muted)]">{item.whyItMatters}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
