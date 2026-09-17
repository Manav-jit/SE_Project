import { NextRequest, NextResponse } from 'next/server';
import { generateFilledForm } from '@/lib/pdf/generator';

export async function POST(req: NextRequest) {
  try {
    const { profile, schemeId } = await req.json();
    
    if (!schemeId) {
      return NextResponse.json({ error: "Missing schemeId" }, { status: 400 });
    }

    const pdfBytes = await generateFilledForm(profile, schemeId);

    // Return as downloadable PDF
    return new NextResponse(pdfBytes as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${schemeId}_application.pdf"`,
      }
    });

  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 });
  }
}
