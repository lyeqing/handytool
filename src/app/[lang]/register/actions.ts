"use server";

import { redirect } from "next/navigation";
import { registerAccount } from "@/lib/handytool-api";
import { defaultLocale, isLocale } from "@/i18n/config";
import { registrationCopy } from "@/i18n/registration-copy";

export interface RegistrationState {
  message: string;
  errors: Record<string, string>;
  values: Record<string, string>;
}

export async function registerAction(lang: string, _previous: RegistrationState | null, form: FormData): Promise<RegistrationState> {
  const locale = isLocale(lang) ? lang : defaultLocale;
  const t = registrationCopy(locale);
  const value = (name: string) => typeof form.get(name) === "string" ? String(form.get(name)).trim() : "";
  // Never return passwords or tokens in action state (which is sent to the browser).
  const values = Object.fromEntries(["displayName", "email", "phone", "accountKind", "companyName", "country", "address", "websiteUrl"].map(name => [name, value(name)]));
  if (values.accountKind !== "Personal" && values.accountKind !== "Company")
    return { message: t.errorTitle, errors: { accountKind: t.invalid }, values };
  const password = typeof form.get("password") === "string" ? String(form.get("password")) : "";
  if (password.length > 1024) return { message: t.errorTitle, errors: { password: t.tooLong }, values };
  const result = await registerAccount({
    displayName: values.displayName, email: values.email, phone: values.phone || undefined, password,
    accountKind: values.accountKind,
    ...(values.accountKind === "Company" ? { company: { name: values.companyName, country: values.country || undefined, address: values.address || undefined, websiteUrl: values.websiteUrl || undefined } } : {}),
  });
  if (result.ok) redirect(`/${locale}`);
  const errors: Record<string, string> = {};
  const fields: Record<string, string> = { "company.name": "companyName", "company.country": "country", "company.address": "address", "company.websiteUrl": "websiteUrl" };
  for (const error of result.problem?.errors ?? []) {
    const key = fields[error.fieldKey] ?? error.fieldKey;
    errors[key] = error.errorCode === "required" ? t.required :
      error.errorCode === "too_long" ? t.tooLong :
      error.errorCode === "too_short" ? t.tooShort :
      error.errorCode === "duplicate_email" ? t.duplicate :
      key === "email" ? t.invalidEmail : key === "websiteUrl" ? t.invalidWebsite : t.invalid;
  }
  return { message: result.status === 429 ? t.throttled : result.status === 0 || result.status >= 500 ? t.unavailable : result.status === 409 ? t.duplicate : t.errorTitle, errors, values };
}
