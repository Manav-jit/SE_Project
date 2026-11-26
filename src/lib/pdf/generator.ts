import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib';
import { loadSchemes } from '../schemes/loader';
import { UserProfile } from '../chat/profile';

// Helper to clean non-WinAnsi characters (such as ₹ symbol) to avoid PDF encoding crashes
function cleanPdfText(text: string): string {
  if (!text) return '';
  return text
    .replace(/₹/g, 'Rs. ')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .trim();
}

// Helper to wrap text into multiple lines given a max width and font size
function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const words = cleanPdfText(text).split(' ');
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

  // Palette: Sovereign Emerald theme matching SchemeSaathi DPI
  const darkGreen = rgb(0.09, 0.4, 0.2);   // #166534 Sovereign Emerald
  const mintBg = rgb(0.86, 0.99, 0.91);     // #DCFCE7 Soft Mint Badge
  const lightBg = rgb(0.97, 0.98, 0.99);   // #F8FAFC Clean Slate
  const borderGray = rgb(0.8, 0.85, 0.82);
  const darkGray = rgb(0.18, 0.24, 0.2);
  const white = rgb(1, 1, 1);
  const verifiedGreen = rgb(0.09, 0.4, 0.2);

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
    color: mintBg,
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

import { ApplicationRecord } from '../storage/applications';

export async function generateAcknowledgementReceipt(application: ApplicationRecord): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const darkGreen = rgb(0.09, 0.4, 0.2);   // #166534 Sovereign Emerald
  const softGreen = rgb(0.86, 0.99, 0.91);  // #DCFCE7 Mint
  const slateBg = rgb(0.97, 0.98, 0.99);    // #F8FAFC Clean Slate
  const borderGray = rgb(0.8, 0.85, 0.82);
  const darkGray = rgb(0.18, 0.24, 0.2);
  const white = rgb(1, 1, 1);

  const margin = 40;
  const contentWidth = 595.28 - (margin * 2);
  let y = 805;

  // 1. Top Decorative Bar
  page.drawRectangle({
    x: margin,
    y: y,
    width: contentWidth,
    height: 8,
    color: darkGreen,
  });
  y -= 25;

  // 2. Official Header
  page.drawText("GOVERNMENT OF INDIA • CITIZEN WELFARE REGISTRY", {
    x: margin,
    y,
    size: 9,
    font: fontBold,
    color: darkGray,
  });

  const printDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const dateText = `Issued: ${printDate}`;
  const dateWidth = fontRegular.widthOfTextAtSize(dateText, 9);
  page.drawText(dateText, {
    x: margin + contentWidth - dateWidth,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });
  y -= 28;

  // Title: Official Acknowledgement Receipt
  page.drawText("OFFICIAL APPLICATION SUBMISSION RECEIPT", {
    x: margin,
    y,
    size: 16,
    font: fontBold,
    color: darkGreen,
  });
  y -= 14;
  page.drawText("Direct Benefit Transfer (DBT) National Tracking Registry Acknowledgement Slip", {
    x: margin,
    y,
    size: 9,
    font: fontRegular,
    color: darkGray,
  });
  y -= 25;

  // 3. Application Summary Banner
  page.drawRectangle({
    x: margin,
    y: y - 50,
    width: contentWidth,
    height: 50,
    color: softGreen,
    borderColor: darkGreen,
    borderWidth: 1.5,
  });

  page.drawText("REFERENCE ID:", { x: margin + 14, y: y - 18, size: 8, font: fontBold, color: darkGreen });
  page.drawText(application.id, { x: margin + 14, y: y - 36, size: 14, font: fontBold, color: darkGreen });

  page.drawText("CURRENT STATUS:", { x: margin + 200, y: y - 18, size: 8, font: fontBold, color: darkGreen });
  page.drawText(application.status, { x: margin + 200, y: y - 34, size: 12, font: fontBold, color: darkGreen });

  page.drawText("SUBMISSION MODE:", { x: margin + 350, y: y - 18, size: 8, font: fontBold, color: darkGreen });
  page.drawText(application.submissionMode, { x: margin + 350, y: y - 34, size: 11, font: fontBold, color: darkGray });

  y -= 70;

  // 4. Scheme & Beneficiary Particulars Table
  page.drawRectangle({
    x: margin,
    y: y - 140,
    width: contentWidth,
    height: 140,
    color: slateBg,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Table Header
  page.drawRectangle({
    x: margin,
    y: y - 24,
    width: contentWidth,
    height: 24,
    color: darkGreen,
  });
  page.drawText("BENEFICIARY & SCHEME PARTICULARS", {
    x: margin + 12,
    y: y - 16,
    size: 9,
    font: fontBold,
    color: white,
  });

  const rowY1 = y - 46;
  page.drawText("Scheme Name:", { x: margin + 14, y: rowY1, size: 8.5, font: fontBold, color: darkGray });
  const schemeNameLines = wrapText(application.schemeName, 340, fontRegular, 8.5);
  page.drawText(schemeNameLines[0] || application.schemeName, { x: margin + 120, y: rowY1, size: 8.5, font: fontRegular, color: darkGreen });

  const rowY2 = y - 68;
  page.drawText("Applicant Name:", { x: margin + 14, y: rowY2, size: 8.5, font: fontBold, color: darkGray });
  page.drawText(cleanPdfText(application.applicantName), { x: margin + 120, y: rowY2, size: 8.5, font: fontRegular, color: darkGray });

  page.drawText("Mobile:", { x: margin + 320, y: rowY2, size: 8.5, font: fontBold, color: darkGray });
  page.drawText(cleanPdfText(application.mobile ? `+91 ${application.mobile}` : "Not Disclosed"), { x: margin + 390, y: rowY2, size: 8.5, font: fontRegular, color: darkGray });

  const rowY3 = y - 90;
  page.drawText("Aadhaar (Last 4):", { x: margin + 14, y: rowY3, size: 8.5, font: fontBold, color: darkGray });
  page.drawText(cleanPdfText(application.aadhaarLast4 ? `XXXX-XXXX-${application.aadhaarLast4}` : "Verified eKYC Token"), { x: margin + 120, y: rowY3, size: 8.5, font: fontRegular, color: darkGray });

  page.drawText("Domicile State:", { x: margin + 320, y: rowY3, size: 8.5, font: fontBold, color: darkGray });
  page.drawText(cleanPdfText(application.state), { x: margin + 390, y: rowY3, size: 8.5, font: fontRegular, color: darkGray });

  const rowY4 = y - 112;
  page.drawText("Submission Date:", { x: margin + 14, y: rowY4, size: 8.5, font: fontBold, color: darkGray });
  page.drawText(new Date(application.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), { x: margin + 120, y: rowY4, size: 8.5, font: fontRegular, color: darkGray });

  page.drawText("CSC Center:", { x: margin + 320, y: rowY4, size: 8.5, font: fontBold, color: darkGray });
  page.drawText(cleanPdfText(application.cscCenter || "Direct Digital Seva Hub"), { x: margin + 390, y: rowY4, size: 8.5, font: fontRegular, color: darkGray });

  const rowY5 = y - 130;
  page.drawText("Sanctioned Benefit:", { x: margin + 14, y: rowY5, size: 8.5, font: fontBold, color: darkGray });
  const benefitLines = wrapText(application.sanctionedAmount || "Direct Statutory Benefit under Scheme Guidelines", 380, fontBold, 8.5);
  page.drawText(benefitLines[0] || "Direct Statutory Benefit", { x: margin + 120, y: rowY5, size: 8.5, font: fontBold, color: darkGreen });

  y -= 160;

  // 5. Tracking Milestones Stepper Box
  const milestones = application.trackingMilestones || [];
  const milestoneBoxHeight = Math.max(140, (milestones.length * 32) + 40);

  page.drawRectangle({
    x: margin,
    y: y - milestoneBoxHeight,
    width: contentWidth,
    height: milestoneBoxHeight,
    color: white,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: margin,
    y: y - 24,
    width: contentWidth,
    height: 24,
    color: darkGreen,
  });
  page.drawText("VERIFIED SCRUTINY & DISBURSEMENT MILESTONES", {
    x: margin + 12,
    y: y - 16,
    size: 9,
    font: fontBold,
    color: white,
  });

  let mileY = y - 48;
  milestones.forEach((m, idx) => {
    const isCompleted = m.status === 'COMPLETED';
    const isProgress = m.status === 'IN_PROGRESS';

    // Badge Circle
    page.drawCircle({
      x: margin + 20,
      y: mileY + 3,
      size: 7,
      color: isCompleted ? darkGreen : isProgress ? rgb(0.85, 0.6, 0.1) : borderGray,
    });

    page.drawText(`${idx + 1}. ${cleanPdfText(m.stage)}`, {
      x: margin + 36,
      y: mileY,
      size: 8.5,
      font: fontBold,
      color: isCompleted ? darkGreen : darkGray,
    });

    const statusBadge = `[${m.status}]`;
    const statusW = fontBold.widthOfTextAtSize(statusBadge, 7.5);
    page.drawText(statusBadge, {
      x: margin + contentWidth - statusW - 14,
      y: mileY,
      size: 7.5,
      font: fontBold,
      color: isCompleted ? darkGreen : isProgress ? rgb(0.85, 0.6, 0.1) : borderGray,
    });

    if (m.officerRemark) {
      page.drawText(cleanPdfText(`Officer Remark: ${m.officerRemark}`), {
        x: margin + 36,
        y: mileY - 12,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.4, 0.45, 0.4),
      });
    }

    mileY -= 32;
  });

  y -= (milestoneBoxHeight + 20);

  // 6. Security Attestation & Official QR Seal Block
  page.drawRectangle({
    x: margin,
    y: y - 75,
    width: contentWidth,
    height: 75,
    color: rgb(0.98, 0.98, 0.96),
    borderColor: darkGreen,
    borderWidth: 1,
  });

  page.drawText("AUTHENTIC DIGITAL RECEIPT ATTESTATION", {
    x: margin + 12,
    y: y - 16,
    size: 8.5,
    font: fontBold,
    color: darkGreen,
  });

  const legalNotice = "This electronic acknowledgement confirms the formal lodgement of application in the Government of India Direct Benefit Transfer (DBT) scheme repository. Retain this Reference ID for all future grievance redressal and tracking.";
  const legalLines = wrapText(legalNotice, contentWidth - 110, fontRegular, 7.5);
  let ly = y - 30;
  for (const line of legalLines) {
    page.drawText(line, { x: margin + 12, y: ly, size: 7.5, font: fontRegular, color: darkGray });
    ly -= 10;
  }

  // QR / Verification Code Placeholder Block
  page.drawRectangle({
    x: margin + contentWidth - 85,
    y: y - 68,
    width: 60,
    height: 60,
    color: white,
    borderColor: darkGreen,
    borderWidth: 1.5,
  });
  page.drawText("VERIFIED", {
    x: margin + contentWidth - 78,
    y: y - 35,
    size: 8,
    font: fontBold,
    color: darkGreen,
  });
  page.drawText("GOVT DBT", {
    x: margin + contentWidth - 79,
    y: y - 48,
    size: 7.5,
    font: fontBold,
    color: darkGreen,
  });

  // Footer
  page.drawLine({
    start: { x: margin, y: 35 },
    end: { x: margin + contentWidth, y: 35 },
    thickness: 0.8,
    color: borderGray,
  });
  page.drawText("SchemeSaathi Sovereign DBT Registry • Validated Citizen Document • Reference: " + application.id, {
    x: margin,
    y: 24,
    size: 7.5,
    font: fontRegular,
    color: darkGray,
  });

  return await pdfDoc.save();
}
