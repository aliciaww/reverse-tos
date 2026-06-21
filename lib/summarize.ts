import type { RedFlag, RiskLevel, TosSummary } from "@/types";

const riskOrder: RiskLevel[] = [
  "Low risk",
  "Annoying",
  "Concerning",
  "Very one-sided",
];

type ClausePattern = {
  title: string;
  match: RegExp;
  clauseHint: string;
  whyItMatters: string;
  bullet: string;
  severity: RiskLevel;
};

const clausePatterns: ClausePattern[] = [
  {
    title: "Forced arbitration",
    match: /\barbitration\b/i,
    clauseHint: "Disputes may be resolved through binding arbitration instead of court.",
    whyItMatters: "This can block you from suing in court and usually reduces leverage.",
    bullet: "Disputes may be forced into arbitration instead of open court.",
    severity: "Concerning",
  },
  {
    title: "Class action waiver",
    match: /class action|collective action/i,
    clauseHint: "You may waive the right to participate in a class or collective action.",
    whyItMatters: "That makes it harder to challenge widespread harm together.",
    bullet: "You may be giving up the ability to join a class action.",
    severity: "Concerning",
  },
  {
    title: "Broad content license",
    match: /royalty-free|worldwide license|sub-licensable|transferable license/i,
    clauseHint: "You grant the service a broad license to use, distribute, adapt, or display your content.",
    whyItMatters: "The platform gets wider reuse rights than most users assume.",
    bullet: "You grant them a wide license over content you upload.",
    severity: "Concerning",
  },
  {
    title: "Unilateral policy changes",
    match: /change these terms|updated terms|continued use|revise these terms/i,
    clauseHint: "The company can change the rules later, and continuing to use the service can count as acceptance.",
    whyItMatters: "The agreement can shift after you sign up, without a fresh explicit yes.",
    bullet: "Policies can change later and continued use may count as acceptance.",
    severity: "Annoying",
  },
  {
    title: "Broad termination rights",
    match: /terminate your account|suspend your access|remove content|disable your account/i,
    clauseHint: "The service can remove content or suspend accounts with broad discretion.",
    whyItMatters: "You may have limited warning, explanation, or appeal options.",
    bullet: "They can remove your account or content with broad discretion.",
    severity: "Concerning",
  },
  {
    title: "Auto-renew or recurring charges",
    match: /automatically renew|recurring subscription|auto-renew/i,
    clauseHint: "Subscriptions may renew automatically unless you cancel in time.",
    whyItMatters: "Charges can continue unless you actively opt out.",
    bullet: "Paid plans may auto-renew unless you cancel on time.",
    severity: "Annoying",
  },
  {
    title: "Liability cap",
    match: /liability.*limited|aggregate liability|maximum extent permitted by law/i,
    clauseHint: "The company limits how much money you can recover if something goes wrong.",
    whyItMatters: "Even if you are harmed, the practical value of a claim may be small.",
    bullet: "If they cause harm, the terms may sharply limit what you can recover.",
    severity: "Annoying",
  },
  {
    title: "Extensive data collection",
    match: /device information|usage data|personalized ads|analytics|location data/i,
    clauseHint: "The service can collect device, behavior, and other usage signals to run ads or product decisions.",
    whyItMatters: "A lot of the business value comes from observing how you behave, not just hosting your account.",
    bullet: "Your activity and device data may be used for ads, ranking, or product decisions.",
    severity: "Annoying",
  },
];

function bumpRisk(current: RiskLevel, next: RiskLevel): RiskLevel {
  return riskOrder[Math.max(riskOrder.indexOf(current), riskOrder.indexOf(next))];
}

function clipSentence(text: string, clauseHint: string) {
  const sentence = text
    .split(/(?<=[.!?])\s+/)
    .find((line) => line.length > 30 && line.length < 240 && line.toLowerCase().match(/\b(terminate|license|arbitration|data|renew|class|change|suspend|liability)\b/));

  return sentence?.trim() ?? clauseHint;
}

function buildFallbackSummary(text: string): TosSummary {
  const normalized = text.slice(0, 12000);
  const redFlags: RedFlag[] = [];
  const bulletSet = new Set<string>();
  let riskLevel: RiskLevel = "Low risk";

  for (const pattern of clausePatterns) {
    if (!pattern.match.test(normalized)) {
      continue;
    }

    redFlags.push({
      title: pattern.title,
      clause: clipSentence(normalized, pattern.clauseHint),
      whyItMatters: pattern.whyItMatters,
    });
    bulletSet.add(pattern.bullet);
    riskLevel = bumpRisk(riskLevel, pattern.severity);
  }

  if (redFlags.length === 0) {
    redFlags.push({
      title: "Standard platform boilerplate",
      clause: "The terms mainly describe how the service operates, what users are responsible for, and how disputes or liability are limited.",
      whyItMatters: "Nothing major stands out from the text sample, but it still favors the platform over the user in routine ways.",
    });
    bulletSet.add("Most of this looks like standard service boilerplate rather than an unusual trap.");
  }

  while (bulletSet.size < 4) {
    bulletSet.add([
      "The company writes the rules and keeps room to interpret them broadly.",
      "If the service changes later, continuing to use it may still bind you.",
      "The terms are mainly designed to reduce the company’s legal and operational risk.",
      "Your leverage mostly comes from leaving the service, not negotiating the terms.",
    ][bulletSet.size]);
  }

  const bullets = Array.from(bulletSet).slice(0, 5);

  const verdictByRisk: Record<RiskLevel, string> = {
    "Low risk": "Mostly standard boilerplate, with the usual platform-friendly carveouts.",
    Annoying: "Mostly standard, but there are a few user-unfriendly clauses worth noticing.",
    Concerning: "Several clauses materially favor the company over the user, especially on leverage and recourse.",
    "Very one-sided": "The terms stack power heavily toward the company on enforcement, reuse rights, and dispute control.",
  };

  return {
    verdict: verdictByRisk[riskLevel],
    riskLevel,
    whatYouAgreeTo: bullets,
    redFlags: redFlags.slice(0, 5),
  };
}

async function summarizeWithOpenAI(text: string, sourceUrl?: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You summarize consumer terms of service in plain English. Return strict JSON with keys verdict, riskLevel, whatYouAgreeTo, redFlags. Risk level must be one of: Low risk, Annoying, Concerning, Very one-sided. whatYouAgreeTo must contain 4 to 6 strings. redFlags must contain 2 to 5 objects with title, clause, whyItMatters. Keep the tone concise, specific, and slightly skeptical without sounding alarmist.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Source URL: ${sourceUrl ?? "Unknown"}\n\nTerms text:\n${text.slice(0, 14000)}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "tos_summary",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["verdict", "riskLevel", "whatYouAgreeTo", "redFlags"],
            properties: {
              verdict: { type: "string" },
              riskLevel: {
                type: "string",
                enum: riskOrder,
              },
              whatYouAgreeTo: {
                type: "array",
                minItems: 4,
                maxItems: 6,
                items: { type: "string" },
              },
              redFlags: {
                type: "array",
                minItems: 2,
                maxItems: 5,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["title", "clause", "whyItMatters"],
                  properties: {
                    title: { type: "string" },
                    clause: { type: "string" },
                    whyItMatters: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    output_text?: string;
  };

  if (!payload.output_text) {
    return null;
  }

  return JSON.parse(payload.output_text) as TosSummary;
}

export async function summarizeTerms(text: string, sourceUrl?: string): Promise<TosSummary> {
  try {
    const liveSummary = await summarizeWithOpenAI(text, sourceUrl);

    if (liveSummary) {
      return liveSummary;
    }
  } catch {
    // Fall back to the deterministic summarizer when the model call fails.
  }

  return buildFallbackSummary(text);
}
