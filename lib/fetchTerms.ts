import * as cheerio from "cheerio";

const MAX_TEXT_LENGTH = 100000;
const INSTAGRAM_TERMS_URL = "https://help.instagram.com/termsofuse";
const INSTAGRAM_CMS_ID = "581066165581870";
const REDDIT_TERMS_URL = "https://redditinc.com/policies/user-agreement";

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
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\./g, ".")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function normalizeReadableText(value: string) {
  return cleanWhitespace(
    decodeEntities(
      value
        .replace(/•/g, "\n• ")
        .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")
        .replace(/([.:])([A-Z])/g, "$1 $2"),
    ),
  );
}

function extractWithCheerio(html: string) {
  const $ = cheerio.load(html);

  $("script, style, nav, header, footer, noscript, svg, form, button").remove();
  $(
    [
      "[aria-label*='breadcrumb' i]",
      "[class*='breadcrumb' i]",
      "[class*='cookie' i]",
      "[class*='footer' i]",
      "[class*='header' i]",
      "[class*='modal' i]",
      "[class*='popup' i]",
      "[class*='newsletter' i]",
      "[class*='subscribe' i]",
      "[class*='social' i]",
      "[class*='nav' i]",
      "[id*='cookie' i]",
      "[id*='footer' i]",
      "[id*='header' i]",
      "[id*='nav' i]",
    ].join(","),
  ).remove();

  const root =
    $("main").first() ||
    $("article").first() ||
    $("[role='main']").first() ||
    $("body").first();

  const blocks = root.find("h1, h2, h3, h4, p, li").toArray();
  const lines: string[] = [];

  for (const block of blocks) {
    const tag = block.tagName.toLowerCase();
    const text = normalizeReadableText($(block).text());

    if (!text || text.length < 2) {
      continue;
    }

    if (tag === "li") {
      lines.push(`• ${text}`);
      continue;
    }

    if (/^(h1|h2|h3|h4)$/.test(tag)) {
      lines.push(`\n${text}`);
      continue;
    }

    lines.push(text);
  }

  const extracted = cleanWhitespace(lines.join("\n\n"));
  return extracted.length > 120 ? extracted : cleanWhitespace(decodeEntities(stripTags(root.html() ?? html)));
}

function trimRedditTerms(text: string) {
  const start = text.indexOf("Hello, redditors and people of the Internet!");
  const endMarkers = [
    text.indexOf("Reddit, Inc.303 2nd Street", start),
    text.indexOf("Reddit, Inc. 303 2nd Street", start),
  ].filter((value) => value > start);
  const end = endMarkers.length > 0 ? Math.max(...endMarkers) + 80 : text.length;

  return cleanWhitespace(
    (start >= 0 ? text.slice(start, end) : text).trim(),
  );
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Reverse-TOS/1.0; +https://reverse-tos.vercel.app)",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Could not fetch that page (${response.status}).`);
  }

  return {
    html: await response.text(),
    finalUrl: response.url,
  };
}

async function extractInstagramTerms() {
  const { html } = await fetchHtml(INSTAGRAM_TERMS_URL);
  const textStart = html.indexOf("Welcome to Instagram!");

  if (textStart < 0) {
    throw new Error("Instagram terms text could not be extracted.");
  }

  const textEndMarkers = [
    html.indexOf("Related Articles", textStart),
    html.indexOf("Was this helpful", textStart),
    html.indexOf("English (US)", textStart + 200),
  ].filter((value) => value > textStart);
  const textEnd = textEndMarkers.length > 0 ? Math.min(...textEndMarkers) : textStart + MAX_TEXT_LENGTH * 2;

  return cleanWhitespace(
    decodeEntities(
      html
        .slice(textStart, textEnd)
        .replace(/\\u003C/g, "<")
        .replace(/\\n/g, "\n"),
    ),
  ).slice(0, MAX_TEXT_LENGTH);
}

export async function fetchTerms(url: string) {
  if (
    url === INSTAGRAM_TERMS_URL ||
    url.includes(INSTAGRAM_CMS_ID)
  ) {
    return extractInstagramTerms();
  }

  const { html } = await fetchHtml(url);
  const extracted =
    url.includes("redditinc.com/policies/user-agreement")
      ? trimRedditTerms(extractWithCheerio(html))
      : extractWithCheerio(html);

  if (!extracted || extracted.length < 120) {
    throw new Error("The page loaded, but readable terms text could not be extracted.");
  }

  return extracted.slice(0, MAX_TEXT_LENGTH);
}
