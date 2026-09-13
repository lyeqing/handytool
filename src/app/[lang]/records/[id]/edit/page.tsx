import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecord, getDefinition } from "@/lib/handytool-api";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale } from "@/i18n/config";
import { RecordForm } from "../../../schemas/[id]/records/new/record-form";
export const metadata = { robots: { index: false, follow: false } };
export default async function EditRecordPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params, locale = isLocale(lang) ? lang : defaultLocale;
  const t = getDictionary(locale).editing;
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) notFound();
  const record = await getRecord(id);
  if (!record.ok && record.status === 404) notFound();
  if (!record.ok || !record.data.canEdit)
    return <main id="main-content" className="mx-auto w-full max-w-3xl p-6"><p role="alert">{record.ok ? t.forbidden : t.unavailable}</p></main>;
  const definition = await getDefinition(record.data.objectDefinitionId, locale);
  if (!definition.ok) return <main id="main-content" className="p-6"><p role="alert">{t.unavailable}</p></main>;
  return <main id="main-content" className="mx-auto w-full max-w-3xl px-6 py-10">
    <Link className="text-sky-700 hover:underline" href={`/${locale}/records/${id}`}>{t.back}</Link>
    <h1 className="mt-4 text-3xl font-semibold text-slate-900">{t.editRecord}</h1>
    <p className="mb-8 mt-2 text-slate-600">{definition.data.name}</p>
    <RecordForm key={record.data.revision} locale={locale} t={t} definitionId={definition.data.id}
      fields={definition.data.fields ?? []} initial={record.data} />
  </main>;
}
