type TosViewerProps = {
  text: string;
};

export function TosViewer({ text }: TosViewerProps) {
  return (
    <div className="h-full overflow-hidden border border-[var(--line)] bg-white">
      <article className="h-full overflow-y-auto whitespace-pre-wrap px-4 py-5 font-serif text-[15px] leading-9 text-[#241f1a]">
        {text || "No terms text available."}
      </article>
    </div>
  );
}
