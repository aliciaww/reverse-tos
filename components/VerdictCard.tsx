import { RiskTag } from "@/components/RiskTag";
import type { RiskLevel } from "@/types";

type VerdictCardProps = {
  verdict: string;
  riskLevel: RiskLevel;
};

export function VerdictCard({ verdict, riskLevel }: VerdictCardProps) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
        Verdict
      </p>
      <div className="mt-4 border border-[var(--line)] border-l-4 border-l-[var(--accent)] bg-[var(--accent-soft)] px-4 py-4">
        <RiskTag riskLevel={riskLevel} />
        <p className="mt-3 max-w-xl text-[15px] font-medium leading-7 text-[var(--ink)]">
          {verdict}
        </p>
      </div>
    </section>
  );
}
