import nodemailer from 'nodemailer';

interface SendOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachment?: { filename: string; content: Buffer };
}

export async function sendCertificateEmail(opts: SendOptions) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || `no-reply@certitask.local`;

  if (!host || !port || !user || !pass) {
    // Email not configured - log and exit gracefully
    console.warn('SMTP not configured. Skipping email delivery');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  });

  const mail = {
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text || 'Please find your certificate attached.',
    html: opts.html,
    attachments: opts.attachment
      ? [
          {
            filename: opts.attachment.filename,
            content: opts.attachment.content,
          },
        ]
      : [],
  };

  const info = await transporter.sendMail(mail);
  return info;
}

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM
  );
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!isSmtpConfigured()) return { skipped: true };

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your CertiTask password',
    text: `Use this link to reset your CertiTask password. It expires in 15 minutes and can only be used once:\n\n${resetUrl}`,
  });
}
