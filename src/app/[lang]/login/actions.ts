"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authenticate, logout } from "@/lib/handytool-api";
import { defaultLocale, isLocale } from "@/i18n/config";
export async function signIn(lang: string, form: FormData) {
  const locale = isLocale(lang) ? lang : defaultLocale;
  const email = String(form.get("email") ?? "").trim(), password = String(form.get("password") ?? "");
  if (!email || email.length > 320 || !password || password.length > 1024) redirect(`/${locale}/login?error=credentials`);
  const result = await authenticate(email, password);
  if (!result.ok) redirect(`/${locale}/login?error=${result.status === 429 ? "throttled" : result.status === 0 || result.status >= 500 ? "unavailable" : "credentials"}`);
  redirect(`/${locale}`);
}
export async function signOut(lang: string) {
  const locale = isLocale(lang) ? lang : defaultLocale;
  const result = await logout();
  if (!result.ok && result.status !== 401) redirect(`/${locale}?error=logout`);
  (await cookies()).delete("session_token");
  redirect(`/${locale}`);
}
