import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowEasy CSV Importer",
  description: "AI-powered CSV importer for GrowEasy CRM leads"
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
