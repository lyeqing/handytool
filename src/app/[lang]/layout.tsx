import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AnalyticsProvider } from "@/components/tracking/analytics-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Prerenders one shell per language instead of rendering them on demand. */
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const dictionary = getDictionary(isLocale(lang) ? lang : defaultLocale);

  return {
    title: dictionary.site.title,
    description: dictionary.site.tagline,
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;

  // The middleware only ever routes here with a supported locale, but the segment is still a string
  // as far as the type system is concerned - so an unexpected value falls back rather than crashing.
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const dictionary = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="flex justify-end px-6 py-3">
          <LanguageSwitcher current={locale} label={dictionary.nav.language} />
        </header>
        {children}
        {/* Renders nothing. Mounted here so one tracker covers every route, and so a client-side
            navigation is still seen as a page view. */}
        <AnalyticsProvider language={locale} />
      </body>
    </html>
  );
}
