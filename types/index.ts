export type RiskLevel =
  | "Low risk"
  | "Annoying"
  | "Concerning"
  | "Very one-sided";

export type RedFlag = {
  title: string;
  clause: string;
  whyItMatters: string;
};

export type AgreementCard = {
  label: string;
  detail: string;
};

export type TosSummary = {
  verdict: string;
  riskLevel: RiskLevel;
  agreementCards: AgreementCard[];
  redFlags: RedFlag[];
};

export type BrandTosData = {
  brand: string;
  logo: string | null;
  sourceUrl: string;
  date: string;
  text: string;
  cachedSummary: TosSummary;
};
