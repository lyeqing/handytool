import "server-only";
import type { Locale } from "./config";
import { defaultLocale } from "./config";

import en from "./dictionaries/en.json";
import zhHans from "./dictionaries/zh-Hans.json";

export type Dictionary = typeof en;

/**
 * Statically imported rather than dynamically loaded. Two small dictionaries are not worth a
 * per-request import, and importing them directly means TypeScript checks that zh-Hans has every key
 * en does - a missing translation is a build error, not a blank string in production.
 */
const dictionaries: Record<Locale, Dictionary> = {
  en,
  "zh-Hans": zhHans,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}

/**
 * Turns a validation error from the API into a sentence in the reader's language.
 *
 * The API sends English prose alongside every error, but it also sends a stable `errorCode` and the
 * `fieldKey` it belongs to - and those are what we translate. The English `message` is only ever a
 * fallback for a code this dictionary has not caught up with yet.
 */
export function translateError(
  dictionary: Dictionary,
  errorCode: string,
  fieldLabel: string,
  fallbackMessage: string,
): string {
  const template = (dictionary.errors as Record<string, string>)[errorCode];

  return template ? template.replace("{field}", fieldLabel) : fallbackMessage;
}
