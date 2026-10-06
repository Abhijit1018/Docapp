import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Devanagari, Noto_Sans_Gujarati, Plus_Jakarta_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { asLang, LANG_COOKIE } from "@/lib/i18n";
import "./globals.css";

// One family across all three scripts: Noto Sans, the plain, professional
// face most Indian phones already use. Only the basic Latin file is preloaded;
// latin-ext (which carries the rupee sign), Devanagari and Gujarati download
// when a page actually uses them.
const latin = Noto_Sans({ subsets: ["latin"], variable: "--font-latin", display: "swap" });
// Headings are set in Plus Jakarta Sans; Hindi and Gujarati headings fall through to Noto.
const display = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display-latin", display: "swap" });
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-deva", display: "swap", preload: false });
const gujr = Noto_Sans_Gujarati({ subsets: ["gujarati"], variable: "--font-gujr", display: "swap", preload: false });

export const metadata: Metadata = {
  title: "Serenity Clinic",
  description: "A clinic website with real online booking and a front-desk screen. Demo by Soulplex Studios.",
  robots: { index: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0b5fbf" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = asLang((await cookies()).get(LANG_COOKIE)?.value);
  return (
    <html lang={lang} suppressHydrationWarning className={`${latin.variable} ${display.variable} ${deva.variable} ${gujr.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
