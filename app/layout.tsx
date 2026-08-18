import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "CertiTask",
  title: {
    default: "CertiTask",
    template: "%s | CertiTask",
  },
  description:
    "CertiTask helps companies and students manage certifications, track tasks, and streamline compliance workflows.",
  keywords: ["certifications", "task management", "compliance", "CertiTask"],
  icons: {
    icon: [
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/app-icon-128.png", type: "image/png", sizes: "128x128" },
      { url: "/app-icon-256.png", type: "image/png", sizes: "256x256" },
      { url: "/app-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon-32.png",
    apple: "/app-icon-256.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
