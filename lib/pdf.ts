import PDFDocument from 'pdfkit';

export async function generateCertificatePdf(certificate: {
  certId: string;
  title: string;
  studentName: string;
  studentEmail: string;
  issueDate: string;
  expiryDate: string;
  companyName?: string;
}) {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Simple certificate layout
      doc.fontSize(20).fillColor('#07203b').text('Certificate of Completion', { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(12).fillColor('#6b7280').text(certificate.companyName || 'CertiTask', { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(16).fillColor('#111827').text(certificate.title, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(14).text(`Presented to: ${certificate.studentName}`, { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(12).fillColor('#374151').text(`Email: ${certificate.studentEmail}`, { align: 'center' });
      doc.moveDown(1);

      doc.fontSize(11).fillColor('#6b7280').text(`Issue Date: ${certificate.issueDate}    Expiry Date: ${certificate.expiryDate}`, { align: 'center' });
      doc.moveDown(3);

      doc.fontSize(10).fillColor('#9CA3AF').text(`Certificate ID: ${certificate.certId}`, { align: 'center' });

      // Signature block
      doc.moveDown(5);
      doc.fontSize(12).fillColor('#111827').text('Authorized Signature', { align: 'left' });
      doc.moveDown(0.5);
      doc.moveTo(80, doc.y).lineTo(260, doc.y).stroke('#e5e7eb');

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
