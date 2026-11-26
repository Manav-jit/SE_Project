import { NextRequest, NextResponse } from 'next/server';
import { 
  parseGovernmentSchemeText, 
  saveIngestedScheme, 
  fetchAndIngestFromGovUrl 
} from '@/lib/schemes/ingest';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, text } = body;

    if (!url && !text) {
      return NextResponse.json({ 
        error: "Please provide either an official government 'url' or raw scheme 'text' from a government portal/gazette." 
      }, { status: 400 });
    }

    let result;

    if (url) {
      result = await fetchAndIngestFromGovUrl(url);
    } else {
      const scheme = parseGovernmentSchemeText(text, url);
      const filePath = await saveIngestedScheme(scheme);
      result = { success: true, scheme, filePath };
    }

    return NextResponse.json({
      success: true,
      message: `Scheme "${result.scheme.name}" successfully parsed and added to SchemeSaathi catalog.`,
      scheme: result.scheme,
      filePath: result.filePath,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Scheme Ingestion Error:", error);
    const message = error instanceof Error ? error.message : "Failed to ingest government scheme";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "SchemeSaathi Government Scheme Ingestion Gateway",
    supportedSources: [
      { name: "myScheme Portal", url: "https://www.myscheme.gov.in/" },
      { name: "National Portal of India", url: "https://www.india.gov.in/" },
      { name: "Open Government Data (OGD)", url: "https://data.gov.in/" },
      { name: "Direct Ministry Portals", examples: ["agricoop.nic.in", "pmayg.nic.in", "pmsuryaghar.gov.in"] }
    ],
    usage: {
      method: "POST",
      bodyOptions: [
        { url: "https://example.gov.in/scheme-detail" },
        { text: "Paste official government press release or gazette notification text here" }
      ]
    }
  });
}
