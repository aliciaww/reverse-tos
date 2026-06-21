import { RiskTag } from "@/components/RiskTag";
import type { RiskLevel } from "@/types";

type VerdictCardProps = {
  verdict: string;
  riskLevel: RiskLevel;
};

export function VerdictCard({ verdict, riskLevel }: VerdictCardProps) {
  return (
    <section className="rounded-[34px] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)] sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-strong)]">
        Verdict
      </p>
      <p className="mt-4 max-w-xl font-serif text-3xl leading-tight sm:text-[2.5rem]">
        {verdict}
      </p>
      <div className="mt-6">
        <RiskTag riskLevel={riskLevel} />
      </div>
    </section>
  );
}
