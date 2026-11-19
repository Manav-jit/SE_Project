import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import { loadSchemes } from '../schemes/loader';
import { UserProfile } from '../chat/profile';

// Helper to wrap text into multiple lines given a max width and font size
function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function generateFilledForm(profile: UserProfile, schemeId: string): Promise<Uint8Array> {
  const schemes = await loadSchemes();
  const scheme = schemes.find(s => s.id === schemeId) || {
    id: schemeId,
    name: schemeId.toUpperCase().replace(/_/g, ' '),
    ministry: "Government of India",
    category: "Welfare",
    benefits: "Financial and social welfare support as per official scheme guidelines.",
    documents_required: ["Aadhaar Card", "Bank Account Details", "Passport Size Photograph"],
    application_process: ["Submit to nearest Common Service Centre or official portal."]
  };

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size: 595 x 842 points
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Palette: Dark green theme matching SchemeSaathi
  const darkGreen = rgb(0.18, 0.29, 0.13); // #2D4A22
  const limeGreen = rgb(0.61, 0.85, 0.41); // #9CD869
  const lightBg = rgb(0.96, 0.98, 0.94);   // #F4F8F0
  const borderGray = rgb(0.75, 0.8, 0.73);
  const darkGray = rgb(0.3, 0.35, 0.3);
  const white = rgb(1, 1, 1);
  const verifiedGreen = rgb(0.13, 0.6, 0.2);

  const margin = 40;
  const contentWidth = 595.28 - (margin * 2);
  let y = 805;

  // 1. Top Decorative Bar
  page.drawRectangle({
    x: margin,
    y: y,
    width: contentWidth,
    height: 6,
    color: darkGreen,
  });
  y -= 25;

  // 2. Official Header
  page.drawText("GOVERNMENT WELFARE APPLICATION FORM", {
    x: margin,
    y,
    size: 9,
    font: fontBold,
    color: darkGray,
  });

  // Reference Code
  const refCode = `SS-${schemeId.slice(0, 4).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const refText = `Ref: ${refCode}  |  Date: ${dateStr}`;
  const refWidth = fontRegular.widthOfTextAtSize(refText, 9);
  page.drawText(refText, {
    x: margin + contentWidth - refWidth,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });
  y -= 28;

  // Scheme Title
  const schemeTitleLines = wrapText(scheme.name, contentWidth - 120, fontBold, 15);
  for (const line of schemeTitleLines) {
    page.drawText(line, {
      x: margin,
      y,
      size: 15,
      font: fontBold,
      color: darkGreen,
    });
    y -= 18;
  }

  // Ministry
  page.drawText(scheme.ministry, {
    x: margin,
    y,
    size: 10,
    font: fontRegular,
    color: darkGray,
  });

  // Category Badge (top right)
  const catText = scheme.category.toUpperCase();
  const catWidth = fontBold.widthOfTextAtSize(catText, 8);
  page.drawRectangle({
    x: margin + contentWidth - catWidth - 16,
    y: y - 2,
    width: catWidth + 16,
    height: 18,
    color: limeGreen,
    borderColor: darkGreen,
    borderWidth: 1,
  });
  page.drawText(catText, {
    x: margin + contentWidth - catWidth - 8,
    y: y + 3,
    size: 8,
    font: fontBold,
    color: darkGreen,
  });
  y -= 20;

  // Horizontal divider
  page.drawLine({
    start: { x: margin, y },
    end: { x: margin + contentWidth, y },
    thickness: 1,
    color: borderGray,
  });
  y -= 18;

  // 3. DigiLocker Verified Stamp
  if (profile.verified) {
    page.drawRectangle({
      x: margin,
      y: y - 22,
      width: contentWidth,
      height: 26,
      color: rgb(0.92, 0.98, 0.92),
      borderColor: verifiedGreen,
      borderWidth: 1.5,
    });
    page.drawText("[AUTHENTICATED] DIGILOCKER VERIFIED CITIZEN - KYC & IDENTITY VERIFIED", {
      x: margin + 12,
      y: y - 14,
      size: 9,
      font: fontBold,
      color: verifiedGreen,
    });
    y -= 34;
  }

  // 4. Section: Applicant Details
  page.drawRectangle({
    x: margin,
    y: y - 16,
    width: contentWidth,
    height: 20,
    color: darkGreen,
  });
  page.drawText("SECTION 1: APPLICANT PARTICULARS", {
    x: margin + 8,
    y: y - 11,
    size: 9,
    font: fontBold,
    color: white,
  });
  y -= 22;

  // Applicant Data Table Box
  const tableHeight = 110;
  page.drawRectangle({
    x: margin,
    y: y - tableHeight,
    width: contentWidth,
    height: tableHeight,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  const rowHeight = 27;
  const col1X = margin + 12;
  const col1ValX = margin + 130;
  const col2X = margin + 270;
  const col2ValX = margin + 380;

  const applicantRows = [
    {
      label1: "Full Name:",
      val1: profile.name || "Not Specified (Attach ID)",
      label2: "Age / Gender:",
      val2: `${profile.age ? profile.age + ' Years' : 'N/A'} / ${profile.gender ? profile.gender.toUpperCase() : 'N/A'}`
    },
    {
      label1: "State / UT:",
      val1: profile.state || "Not Specified",
      label2: "Occupation:",
      val2: profile.occupation ? profile.occupation.toUpperCase() : "N/A"
    },
    {
      label1: "Annual Income:",
      val1: profile.income ? `Rs. ${Number(profile.income).toLocaleString('en-IN')}` : "Not Disclosed / Below Threshold",
      label2: "Category / Caste:",
      val2: profile.caste ? profile.caste.toUpperCase() : "General"
    },
    {
      label1: "Application Mode:",
      val1: "SchemeSaathi Smart Engine",
      label2: "Verification Status:",
      val2: profile.verified ? "Verified via DigiLocker" : "Self-Declared"
    }
  ];

  let tableY = y - 18;
  applicantRows.forEach((r, idx) => {
    // Labels
    page.drawText(r.label1, { x: col1X, y: tableY, size: 8.5, font: fontBold, color: darkGray });
    page.drawText(r.val1, { x: col1ValX, y: tableY, size: 8.5, font: fontRegular, color: darkGreen });

    page.drawText(r.label2, { x: col2X, y: tableY, size: 8.5, font: fontBold, color: darkGray });
    page.drawText(r.val2, { x: col2ValX, y: tableY, size: 8.5, font: fontRegular, color: darkGreen });

    if (idx < applicantRows.length - 1) {
      page.drawLine({
        start: { x: margin + 6, y: tableY - 7 },
        end: { x: margin + contentWidth - 6, y: tableY - 7 },
        thickness: 0.5,
        color: borderGray,
      });
    }
    tableY -= rowHeight;
  });
  y -= tableHeight + 16;

  // 5. Section: Scheme Entitlement & Benefits
  page.drawRectangle({
    x: margin,
    y: y - 16,
    width: contentWidth,
    height: 20,
    color: darkGreen,
  });
  page.drawText("SECTION 2: CLAIMED BENEFITS & ENTITLEMENTS", {
    x: margin + 8,
    y: y - 11,
    size: 9,
    font: fontBold,
    color: white,
  });
  y -= 22;

  const benefitLines = wrapText(scheme.benefits, contentWidth - 24, fontRegular, 9);
  const benefitBoxHeight = Math.max(36, benefitLines.length * 14 + 16);
  page.drawRectangle({
    x: margin,
    y: y - benefitBoxHeight,
    width: contentWidth,
    height: benefitBoxHeight,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  let benefitY = y - 15;
  for (const line of benefitLines) {
    page.drawText(line, {
      x: margin + 12,
      y: benefitY,
      size: 9,
      font: fontRegular,
      color: darkGreen,
    });
    benefitY -= 14;
  }
  y -= benefitBoxHeight + 16;

  // 6. Section: Required Documents Checklist
  page.drawRectangle({
    x: margin,
    y: y - 16,
    width: contentWidth,
    height: 20,
    color: darkGreen,
  });
  page.drawText("SECTION 3: MANDATORY ENCLOSURES CHECKLIST", {
    x: margin + 8,
    y: y - 11,
    size: 9,
    font: fontBold,
    color: white,
  });
  y -= 22;

  const docs = scheme.documents_required || ["Aadhaar Card", "Bank Account Details"];
  const docBoxHeight = (docs.length * 18) + 14;
  page.drawRectangle({
    x: margin,
    y: y - docBoxHeight,
    width: contentWidth,
    height: docBoxHeight,
    color: lightBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  let docY = y - 16;
  docs.forEach((doc: string) => {
    // Checkbox box
    page.drawRectangle({
      x: margin + 12,
      y: docY - 1,
      width: 10,
      height: 10,
      borderColor: darkGreen,
      borderWidth: 1,
      color: white,
    });
    page.drawText(doc, {
      x: margin + 30,
      y: docY,
      size: 8.5,
      font: fontRegular,
      color: darkGreen,
    });
    docY -= 18;
  });
  y -= docBoxHeight + 16;

  // 7. Declaration Block
  page.drawRectangle({
    x: margin,
    y: y - 55,
    width: contentWidth,
    height: 55,
    color: rgb(0.98, 0.98, 0.96),
    borderColor: borderGray,
    borderWidth: 0.8,
  });
  page.drawText("APPLICANT DECLARATION:", {
    x: margin + 10,
    y: y - 12,
    size: 8,
    font: fontBold,
    color: darkGreen,
  });
  const declText = "I hereby declare that all particulars stated above are true, correct, and complete to the best of my knowledge. I understand that if any information is found incorrect or misleading, my application is liable to be rejected immediately under the relevant scheme rules.";
  const declLines = wrapText(declText, contentWidth - 20, fontRegular, 7.5);
  let declY = y - 24;
  for (const line of declLines) {
    page.drawText(line, { x: margin + 10, y: declY, size: 7.5, font: fontRegular, color: darkGray });
    declY -= 10;
  }
  y -= 70;

  // 8. Signature Block
  const sigBoxWidth = (contentWidth - 20) / 2;
  // Left: Date & Place
  page.drawText("Date: ________________________", { x: margin, y: y - 10, size: 8.5, font: fontRegular, color: darkGreen });
  page.drawText("Place: _______________________", { x: margin, y: y - 28, size: 8.5, font: fontRegular, color: darkGreen });

  // Right: Signature
  page.drawText("__________________________________________", { x: margin + sigBoxWidth + 20, y: y - 10, size: 8.5, font: fontRegular, color: darkGreen });
  page.drawText("Signature / Thumb Impression of Applicant", { x: margin + sigBoxWidth + 40, y: y - 25, size: 8, font: fontBold, color: darkGray });

  // 9. Bottom Footer Bar
  page.drawLine({
    start: { x: margin, y: 35 },
    end: { x: margin + contentWidth, y: 35 },
    thickness: 0.8,
    color: borderGray,
  });
  page.drawText("Generated by SchemeSaathi Preparation Engine - Verified Document Ready for Physical or CSC Submission", {
    x: margin,
    y: 24,
    size: 7.5,
    font: fontRegular,
    color: darkGray,
  });
  page.drawText("Page 1 of 1", {
    x: margin + contentWidth - 45,
    y: 24,
    size: 7.5,
    font: fontRegular,
    color: darkGray,
  });

  return await pdfDoc.save();
}
