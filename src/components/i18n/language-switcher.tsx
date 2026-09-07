"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  LOCALE_COOKIE,
  localeNames,
  locales,
  type Locale,
} from "@/i18n/config";

interface Props {
  current: Locale;
  label: string;
}

/**
 * Switches language by rewriting the locale segment of the current URL, so the reader stays on the
 * page they were on rather than being dumped back at the home page.
 *
 * It also writes a cookie, which is what the middleware reads on a later visit to a URL with no
 * locale. Not HttpOnly, deliberately - this is a display preference, not a credential, and the
 * component that sets it runs in the browser.
 */
export function LanguageSwitcher({ current, label }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchTo = (next: Locale) => {
    if (next === current) return;

    // One year, matching how long the choice is worth remembering. SameSite=Lax keeps it off
    // cross-site requests; there is nothing sensitive in it either way.
    rememberLocale(next);

    // Swap just the first segment: /zh-Hans/schemas/new stays on the same page in the new language.
    const segments = pathname.split("/");
    segments[1] = next;

    startTransition(() => {
      router.replace((segments.join("/") || `/${next}`) + window.location.search + window.location.hash);
      router.refresh();
    });
  };

  return (
    <nav aria-label={label} className="flex items-center gap-2 text-sm">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          disabled={isPending}
          aria-current={locale === current ? "true" : undefined}
          onClick={() => switchTo(locale)}
          className={
            locale === current
              ? "min-h-10 rounded-lg bg-sky-50 px-3 py-2 text-sky-800"
              : "min-h-10 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          }
        >
          {localeNames[locale]}
        </button>
      ))}
    </nav>
  );
}

function rememberLocale(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
}
