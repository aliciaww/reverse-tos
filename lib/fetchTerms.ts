import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const MAX_TEXT_LENGTH = 100000;
const INSTAGRAM_TERMS_URL = "https://help.instagram.com/termsofuse";
const INSTAGRAM_CMS_ID = "581066165581870";

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
    value
      .replace(/•/g, "\n• ")
      .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")
      .replace(/([.:])([A-Z])/g, "$1 $2"),
  );
}

function fallbackHtmlToText(html: string) {
  const mainMatch =
    html.match(/<main[\s\S]*?<\/main>/i) ??
    html.match(/<article[\s\S]*?<\/article>/i) ??
    html.match(/<body[\s\S]*?<\/body>/i);

  return cleanWhitespace(decodeEntities(stripTags(mainMatch?.[0] ?? html)));
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

  const { html, finalUrl } = await fetchHtml(url);
  const dom = new JSDOM(html, { url: finalUrl });
  const article = new Readability(dom.window.document).parse();

  const extracted =
    article?.textContent && article.textContent.trim().length > 400
      ? normalizeReadableText(article.textContent)
      : fallbackHtmlToText(html);

  if (!extracted || extracted.length < 120) {
    throw new Error("The page loaded, but readable terms text could not be extracted.");
  }

  return extracted.slice(0, MAX_TEXT_LENGTH);
}
