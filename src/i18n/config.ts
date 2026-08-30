/**
 * Mirrors the API's Localization section. Keep the two lists in step: the backend validates language
 * tags against its own copy, so a locale that exists only here would produce URLs whose translations
 * are silently dropped on save.
 */
export const locales = ["en", "zh-Hans"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** What the language switcher shows. Each name is written in its own language, as it should be. */
export const localeNames: Record<Locale, string> = {
  en: "English",
  "zh-Hans": "简体中文",
};

/** Remembers the choice across visits. Not HttpOnly - the switcher is client-side. */
export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value !== undefined && value !== null && (locales as readonly string[]).includes(value);
}

/**
 * Best supported match for an Accept-Language header, mirroring the API's resolution: each candidate
 * is tried exactly and then by primary subtag, in quality order. A browser asking for zh-CN gets
 * zh-Hans rather than falling all the way back to English.
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const candidates = acceptLanguage
    .split(",")
    .map((entry) => {
      const [tag, ...params] = entry.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="));
      return { tag: tag.trim(), quality: q ? Number.parseFloat(q.slice(2)) : 1 };
    })
    .filter((c) => c.tag.length > 0 && !Number.isNaN(c.quality) && c.quality > 0)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of candidates) {
    const exact = locales.find((l) => l.toLowerCase() === tag.toLowerCase());
    if (exact) return exact;

    const primary = tag.split("-")[0].toLowerCase();
    const prefixed = locales.find(
      (l) => l.toLowerCase() === primary || l.toLowerCase().startsWith(`${primary}-`),
    );
    if (prefixed) return prefixed;
  }

  return defaultLocale;
}
