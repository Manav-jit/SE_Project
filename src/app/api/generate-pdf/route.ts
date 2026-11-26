import { NextRequest, NextResponse } from 'next/server';
import { generateFilledForm, generateAcknowledgementReceipt } from '@/lib/pdf/generator';
import { getApplicationById } from '@/lib/storage/applications';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, profile, schemeId, applicationId } = body;

    // 1. Generate Acknowledgement Receipt for submitted application
    if (type === 'receipt' || applicationId) {
      const idToLookup = applicationId || body.id;
      if (!idToLookup) {
        return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });
      }

      const application = await getApplicationById(idToLookup);
      if (!application) {
        return NextResponse.json({ error: "Application not found in tracking registry" }, { status: 404 });
      }

      const receiptBytes = await generateAcknowledgementReceipt(application);
      return new NextResponse(receiptBytes as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="acknowledgement_${application.id}.pdf"`,
        },
      });
    }

    // 2. Generate Standardized Welfare Application Form
    if (!schemeId) {
      return NextResponse.json({ error: "Missing schemeId" }, { status: 400 });
    }

    const pdfBytes = await generateFilledForm(profile || {}, schemeId);

    return new NextResponse(pdfBytes as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${schemeId}_application.pdf"`,
      },
    });

  } catch (error: unknown) {
    console.error("PDF Generation Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
