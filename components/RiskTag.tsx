import type { RiskLevel } from "@/types";

const riskStyles: Record<RiskLevel, string> = {
  "Low risk": "bg-[var(--risk-low-bg)] text-[var(--risk-low-text)]",
  Annoying: "bg-[var(--risk-annoying-bg)] text-[var(--risk-annoying-text)]",
  Concerning: "bg-[var(--risk-concerning-bg)] text-[var(--risk-concerning-text)]",
  "Very one-sided": "bg-[var(--risk-very-bg)] text-[var(--risk-very-text)]",
};

export function RiskTag({ riskLevel }: { riskLevel: RiskLevel }) {
  return (
    <span
      className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${riskStyles[riskLevel]}`}
    >
      {riskLevel}
    </span>
  );
}
