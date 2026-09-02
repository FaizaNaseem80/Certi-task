import { PDFDocument, PDFFont, StandardFonts, rgb, Color } from 'pdf-lib';
import fs from 'node:fs/promises';
import path from 'node:path';
import { logoBase64 } from './logoBase64';

// Helper to convert hex to rgb
function hexToRgb(hex: string) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return rgb(r, g, b);
}

export async function generateCertificatePdf(certificate: {
  certId: string;
  title: string;
  studentName: string;
  studentEmail: string;
  issueDate: string;
  expiryDate: string;
  companyName?: string;
}): Promise<Buffer> {
  const doc = await PDFDocument.create();
  
  // Create landscape document (A4 is 595.28 x 841.89 points, so landscape is 841.89 x 595.28)
  const width = 841.89;
  const height = 595.28;
  const page = doc.addPage([width, height]);

  // Embed standard fonts
  const fontHelvetica = await doc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontHelveticaOblique = await doc.embedFont(StandardFonts.HelveticaOblique);
  const fontTimesRoman = await doc.embedFont(StandardFonts.TimesRoman);
  const fontTimesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const fontTimesBoldItalic = await doc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const navyColor = hexToRgb('0F2A4A');
  const goldColor = hexToRgb('C9A227');
  const grayColor = hexToRgb('4B5563');
  const lightGrayColor = hexToRgb('9CA3AF');

  // Decorative outer border (Navy)
  page.drawRectangle({
    x: 20, y: 20,
    width: width - 40, height: height - 40,
    borderWidth: 4,
    borderColor: navyColor,
  });

  // Decorative inner border (Gold)
  page.drawRectangle({
    x: 30, y: 30,
    width: width - 60, height: height - 60,
    borderWidth: 1.5,
    borderColor: goldColor,
  });

  const drawCenteredText = (text: string, font: PDFFont, size: number, y: number, color: Color) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: height - y,
      size,
      font,
      color,
    });
  };

  // Embed Logo
  const logoImageBytes = Buffer.from(logoBase64, 'base64');
  const logoImage = await doc.embedPng(logoImageBytes);
  const logoDims = logoImage.scale(0.35); // scale down the 128x128 image

  let signatureImage = null;
  try {
    const signatureImageBytes = await fs.readFile(path.join(process.cwd(), 'public', 'signature.png'));
    signatureImage = await doc.embedPng(signatureImageBytes);
  } catch {
    console.warn("signature.png not found, rendering text signature line");
  }

  page.drawImage(logoImage, {
    x: width / 2 - logoDims.width / 2,
    y: height - 40 - logoDims.height,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Top branding
  drawCenteredText('CertiTask Credential System', fontHelveticaBold, 14, 100, navyColor);

  // Main Title
  drawCenteredText('CERTIFICATE', fontTimesBold, 46, 145, navyColor);
  drawCenteredText('OF COMPLETION', fontTimesRoman, 18, 175, goldColor);

  // Subtitle
  drawCenteredText('This is to certify that', fontHelveticaOblique, 14, 220, grayColor);

  // Student Name
  const nameY = 270;
  drawCenteredText(certificate.studentName, fontTimesBoldItalic, 40, nameY, navyColor);

  // Decorative line under the name
  const nameWidth = fontTimesBoldItalic.widthOfTextAtSize(certificate.studentName, 40);
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 30, y: height - nameY - 10 },
    end: { x: (width + nameWidth) / 2 + 30, y: height - nameY - 10 },
    thickness: 1,
    color: goldColor,
  });

  // Description
  drawCenteredText('has successfully completed the internship/project program:', fontHelvetica, 14, 320, grayColor);
  drawCenteredText(certificate.title, fontHelveticaBold, 22, 355, navyColor);
  drawCenteredText(`sponsored by ${certificate.companyName || 'CertiTask Enterprise'}`, fontHelvetica, 14, 390, grayColor);

  // Footer sections (Issue Date, Certificate ID, Signature)
  const bottomY = height - 480;

  // Left: Date
  page.drawText('Issue Date:', { x: 100, y: bottomY, size: 11, font: fontHelveticaBold, color: navyColor });
  page.drawText(certificate.issueDate, { x: 170, y: bottomY, size: 11, font: fontHelvetica, color: grayColor });

  // Center: Certificate ID
  drawCenteredText(`ID: ${certificate.certId}`, fontHelveticaBold, 14, 480, goldColor);
  drawCenteredText('Verify at: certitask.com/verify', fontHelvetica, 10, 500, lightGrayColor);

  if (signatureImage) {
    const signatureScale = Math.min(150 / signatureImage.width, 65 / signatureImage.height);
    const signatureWidth = signatureImage.width * signatureScale;
    const signatureHeight = signatureImage.height * signatureScale;
    page.drawImage(signatureImage, {
      x: width - 175 - (signatureWidth / 2),
      y: bottomY + 18,
      width: signatureWidth,
      height: signatureHeight,
    });
  }
  
  const signText = 'Authorized Signatory';
  const signWidth = fontHelveticaBold.widthOfTextAtSize(signText, 11);
  page.drawText(signText, {
    x: width - 175 - (signWidth / 2),
    y: bottomY - 5,
    size: 11,
    font: fontHelveticaBold,
    color: navyColor,
  });

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}
