import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledgerise - Monthly Budgeting Made Simple",
  description:
    "Ledgerise helps you take control of your monthly finances with smart budgeting, savings tracking, and spending insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${dmSans.variable} ${instrumentSerif.variable} ${geistMono.variable} font-sans antialiased overflow-x-hidden`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
