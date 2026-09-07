import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/handytool-api";
import { defaultLocale, isLocale } from "@/i18n/config";
import { registrationCopy } from "@/i18n/registration-copy";
import { RegistrationForm } from "./registration-form";

export const metadata = { title: "Register | Handytool", robots: { index: false, follow: false } };
export default async function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const t = registrationCopy(locale);
  if ((await getCurrentUser()).ok) redirect(`/${locale}`);
  return <main id="main-content" className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
    <Link href={`/${locale}`} className="text-sm text-sky-700">← {t.back}</Link>
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t.title}</h1>
      <p className="mt-4 leading-7 text-slate-600">{t.intro}</p>
      <RegistrationForm locale={locale} t={t} />
      <p className="mt-6 text-center text-sm text-slate-600">{t.existing} <Link href={`/${locale}/login`} className="font-medium text-sky-700 hover:underline">{t.signIn}</Link></p>
    </section>
  </main>;
}
