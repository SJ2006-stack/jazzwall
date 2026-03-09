import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../styles/globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JazzWall — AI Meeting Notes for India",
  description:
    "Real-time AI meeting notes for how India actually speaks. Hindi, English, Hinglish — all understood. Get transcripts, summaries, and action items instantly.",
  keywords: ["AI meeting notes", "India", "Hindi transcription", "Hinglish", "meeting summary", "action items", "Google Meet"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "JazzWall — AI Meeting Notes for India",
    description: "Real-time AI meeting notes for how India actually speaks. Hindi, English, Hinglish — all understood.",
    url: "https://jazzwall.ai",
    siteName: "JazzWall",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "JazzWall — AI Meeting Notes for India",
    description: "Real-time AI meeting notes for how India actually speaks. Hindi, English, Hinglish — all understood.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
      <body
        className={`${dmSans.variable} ${playfair.variable} ${geistMono.variable} font-sans antialiased bg-[#FAF9F7] text-zinc-900 selection:bg-amber-500/20`}
      >
        <ClerkProvider signUpFallbackRedirectUrl="/dashboard" signInFallbackRedirectUrl="/dashboard">
          {children}
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}