import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, isLocale, locales, matchLocale } from "@/i18n/config";

/**
 * Runs before any route renders. Named "proxy" rather than "middleware": Next 16 deprecated the
 * middleware file convention in favour of this one.
 *
 * Every page lives under a locale segment, so /tools redirects to /en/tools or /zh-Hans/tools.
 *
 * Locale-prefixed URLs mean each language is a distinct, indexable, shareable address - you can send
 * someone a link and know which language they will see. The cost is this redirect, and the fact that
 * the analytics path now carries a prefix; the API strips it back out so per-page reports do not
 * split in two.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /api/* is the ASP.NET Core API via the reverse proxy (or the dev rewrite). It has nothing to do
  // with page routing and must never be redirected.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (hasLocale) {
    return NextResponse.next();
  }

  // A remembered choice beats the browser's header, so switching language sticks across visits.
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  const locale = isLocale(cookieLocale)
    ? cookieLocale
    : matchLocale(request.headers.get("accept-language"));

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  // Everything except the API, Next's own assets, and files with an extension.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
