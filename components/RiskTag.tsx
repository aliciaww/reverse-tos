import type { RiskLevel } from "@/types";

const riskStyles: Record<RiskLevel, string> = {
  "Low risk": "text-[var(--risk-low-text)]",
  Annoying: "text-[var(--risk-annoying-text)]",
  Concerning: "text-[var(--risk-concerning-text)]",
  "Very one-sided": "text-[var(--risk-very-text)]",
};

export function RiskTag({ riskLevel }: { riskLevel: RiskLevel }) {
  const labels: Record<RiskLevel, string> = {
    "Low risk": "Low risk",
    Annoying: "Medium risk",
    Concerning: "High risk",
    "Very one-sided": "High risk",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${riskStyles[riskLevel]}`}
    >
      <span className="text-[12px]">●</span>
      {labels[riskLevel]}
    </span>
  );
}
