type TosViewerProps = {
  text: string;
};

export function TosViewer({ text }: TosViewerProps) {
  return (
    <article className="h-full overflow-y-auto whitespace-pre-wrap pr-2 font-serif text-[15px] leading-9 text-[#241f1a]">
      {text || "No terms text available."}
    </article>
  );
}
