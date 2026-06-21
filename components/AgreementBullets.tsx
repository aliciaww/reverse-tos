type AgreementBulletsProps = {
  items: string[];
};

export function AgreementBullets({ items }: AgreementBulletsProps) {
  return (
    <section className="mt-5 rounded-[30px] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
        What you&apos;re really agreeing to
      </p>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-1 text-base text-[var(--muted-strong)]">•</span>
            <p className="text-[0.98rem] leading-7 text-[#2a241f]">{item}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
