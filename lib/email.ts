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
    console.warn('SMTP not configured. Skipping sending certificate email to', opts.to);
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
  } as any;

  const info = await transporter.sendMail(mail);
  return info;
}
