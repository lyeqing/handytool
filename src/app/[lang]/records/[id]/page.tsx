import { getDictionary } from "@/i18n/get-dictionary";
import Link from "next/link";
import { getRecord } from "@/lib/handytool-api";
import { homeCopy } from "@/i18n/home-copy";
import { defaultLocale, isLocale } from "@/i18n/config";
export const metadata = { robots: { index: false, follow: false } };
export default async function RecordPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params, locale = isLocale(lang) ? lang : defaultLocale, t = homeCopy(locale);
  const result = await getRecord(id);
  return <main id="main-content" className="mx-auto w-full max-w-3xl flex-1 px-6 py-12"><Link className="text-sm text-sky-700" href={`/${locale}`}>← {t.back}</Link>{result.ok ? <><h1 className="mt-6 text-3xl font-semibold text-slate-900">{result.data.title || t.noTitle}</h1><p className="mt-4 text-slate-600">{result.data.description}</p>{result.data.canEdit && <Link className="btn-secondary mt-6" href={`/${locale}/records/${id}/edit`}>{getDictionary(locale).editing.editRecord}</Link>}<h2 className="mt-10 text-xl font-semibold text-slate-900">{t.values}</h2><dl className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-6">{Object.entries(result.data.values).map(([key, value]) => <div key={key} className="py-5"><dt className="text-sm font-medium text-slate-500">{key}</dt><dd className="mt-2 whitespace-pre-wrap wrap-break-word text-slate-900">{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</dd></div>)}</dl></> : <p role="alert" className="mt-8 rounded-lg bg-amber-50 p-5 text-amber-900">{t.unavailable}</p>}</main>;
}
