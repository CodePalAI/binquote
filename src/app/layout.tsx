import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BinQuote — Instant quote widget for dumpster haulers",
  description:
    "The drop-in quote calculator that turns your website into a 24/7 booking machine. Built for independent roll-off operators.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
