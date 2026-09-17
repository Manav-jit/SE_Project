import { NextRequest, NextResponse } from 'next/server';
import { findRelevantSchemes } from "@/lib/rag/retriever";
import { loadSchemes } from "@/lib/schemes/loader";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const profileStr = searchParams.get('profile');

    // Category-based filtering (no AI needed)
    if (category) {
      const allSchemes = await loadSchemes();
      const filtered = allSchemes.filter(
        s => s.category.toLowerCase() === category.toLowerCase()
      );
      return NextResponse.json({ schemes: filtered });
    }

    // Profile-based AI retrieval
    if (profileStr) {
      const profile = JSON.parse(decodeURIComponent(profileStr));
      const searchString = Object.values(profile).filter(Boolean).join(' ');
      const schemes = await findRelevantSchemes(
        searchString.length > 0 ? searchString : 'welfare schemes',
        3
      );
      return NextResponse.json({ schemes, profile });
    }

    // Default: return all schemes
    const allSchemes = await loadSchemes();
    return NextResponse.json({ schemes: allSchemes });
  } catch (error) {
    console.error("Schemes API error:", error);
    return NextResponse.json({ schemes: [], error: "Failed to load schemes" }, { status: 500 });
  }
}
