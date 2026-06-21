type TosViewerProps = {
  text: string;
};

export function TosViewer({ text }: TosViewerProps) {
  return (
    <section className="flex h-full min-h-[420px] flex-col rounded-[32px] border border-[var(--line)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
          Raw Terms
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <article className="max-w-none whitespace-pre-wrap font-serif text-[1.02rem] leading-8 text-[#241f1a]">
          {text || "No terms text available."}
        </article>
      </div>
    </section>
  );
}
