import { registrationCopy } from "@/i18n/registration-copy";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getCurrentUser } from "@/lib/handytool-api";
import { homeCopy } from "@/i18n/home-copy";
import type { Locale } from "@/i18n/config";
import { signOut } from "@/app/[lang]/login/actions";
export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = homeCopy(locale);
  const user = await getCurrentUser();
  return <>
    <a href="#main-content" className="sr-only focus:not-sr-only focus:p-4">{t.skip}</a>
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-3 text-xl font-semibold tracking-tight text-slate-900"><span aria-hidden="true" className="flex size-9 items-center justify-center rounded-lg bg-sky-600 text-lg text-white">h.</span>handytool<span className="text-sky-600">.</span></Link>
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <LanguageSwitcher current={locale} label={locale === "en" ? "Language" : "语言"} />
          {user.ok ? <form action={signOut.bind(null, locale)}><button className="btn-secondary">{t.signOut}</button></form> : <><Link className="text-sm font-medium text-sky-700 hover:underline" href={`/${locale}/login`}>{t.signIn}</Link><Link className="btn-primary" href={`/${locale}/register`}>{registrationCopy(locale).register}</Link></>}
        </div>
      </div>
    </header>
  </>;
}
export function SiteFooter({ locale }: { locale: Locale }) {
  const t = homeCopy(locale);
  return <footer className="mt-auto border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><Link href={`/${locale}`} className="font-semibold text-slate-700">Handytool</Link><p>{t.footer}</p><p>© {new Date().getUTCFullYear()} Handytool</p></div></footer>;
}
