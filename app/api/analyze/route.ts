import { NextResponse } from "next/server";
import { fetchTerms } from "@/lib/fetchTerms";
import { summarizeTerms } from "@/lib/summarize";

export async function POST(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };

    if (!url) {
      return NextResponse.json(
        { error: "A URL is required." },
        { status: 400 },
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "That URL is not valid." },
        { status: 400 },
      );
    }

    const text = await fetchTerms(parsedUrl.toString());
    const summary = await summarizeTerms(text, parsedUrl.toString());

    return NextResponse.json({
      sourceUrl: parsedUrl.toString(),
      fetchedAt: new Date().toISOString().slice(0, 10),
      text,
      summary,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not fetch or summarize that page.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
