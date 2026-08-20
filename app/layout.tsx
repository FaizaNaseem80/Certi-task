import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "CertiTask",
  title: {
    default: "CertiTask — Connecting Students With Opportunities That Matter",
    template: "%s | CertiTask",
  },
  description:
    "CertiTask helps students discover career opportunities, manage certificates, build professional profiles, and connect with featured companies.",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
