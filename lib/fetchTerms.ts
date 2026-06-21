const MAX_TEXT_LENGTH = 18000;

function stripTags(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanWhitespace(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function fetchTerms(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Reverse-TOS-MVP/1.0",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Could not fetch that page (${response.status}).`);
  }

  const html = await response.text();
  const mainMatch =
    html.match(/<main[\s\S]*?<\/main>/i) ??
    html.match(/<article[\s\S]*?<\/article>/i) ??
    html.match(/<body[\s\S]*?<\/body>/i);
  const extracted = cleanWhitespace(
    decodeEntities(stripTags(mainMatch?.[0] ?? html)),
  );

  if (!extracted) {
    throw new Error("The page loaded, but readable terms text could not be extracted.");
  }

  return extracted.slice(0, MAX_TEXT_LENGTH);
}
