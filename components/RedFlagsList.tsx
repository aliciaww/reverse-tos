import type { RedFlag } from "@/types";

type RedFlagsListProps = {
  items: RedFlag[];
};

export function RedFlagsList({ items }: RedFlagsListProps) {
  return (
    <section className="mt-5 rounded-[30px] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
        Red Flags
      </p>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <article
            key={`${item.title}-${item.clause}`}
            className="rounded-[24px] border border-[var(--line)] bg-[#fcf8f0] p-4"
          >
            <h3 className="text-base font-semibold">{item.title}</h3>
            <blockquote className="mt-3 border-l-2 border-[#d9cfbf] pl-3 text-sm leading-6 text-[var(--muted)]">
              “{item.clause}”
            </blockquote>
            <p className="mt-3 text-sm leading-6 text-[#2d2822]">{item.whyItMatters}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
