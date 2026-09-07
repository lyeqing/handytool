import { homeCopy } from "@/i18n/home-copy";
import { defaultLocale, isLocale } from "@/i18n/config";
import { signIn } from "./actions";
import Link from "next/link";
export const metadata = { robots: { index: false, follow: false } };
export default async function Login({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ error?: string }> }) {
  const { lang } = await params, { error } = await searchParams;
  const locale = isLocale(lang) ? lang : defaultLocale, t = homeCopy(locale);
  return <main id="main-content" className="mx-auto w-full max-w-md flex-1 px-6 py-16"><Link href={`/${locale}`} className="text-sm text-sky-700">← {t.back}</Link><h1 className="mt-8 text-3xl font-semibold tracking-tight text-slate-900">{t.loginTitle}</h1><p className="mt-4 leading-7 text-slate-600">{t.loginIntro}</p>
    {error && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error === "unavailable" ? t.loginUnavailable : error === "throttled" ? t.loginThrottled : t.loginError}</p>}
    <form action={signIn.bind(null, locale)} className="mt-8 space-y-5"><div className="space-y-2"><label htmlFor="email" className="text-sm font-medium">{t.email}</label><input className="form-input" id="email" name="email" type="email" autoComplete="username" maxLength={254} required /></div><div className="space-y-2"><label htmlFor="password" className="text-sm font-medium">{t.password}</label><input className="form-input" id="password" name="password" type="password" autoComplete="current-password" maxLength={1024} required /></div><button className="btn-primary w-full">{t.signIn}</button></form>
  </main>;
}
