import Link from "next/link";
import { getDefinition } from "@/lib/handytool-api";
import { RecordForm } from "./record-form";
import { getDictionary, type Dictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export default async function NewRecordPage(
  props: PageProps<"/[lang]/schemas/[id]/records/new">,
) {
  const { lang, id } = await props.params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const t = getDictionary(locale);

  const definitionId = Number(id);

  if (!Number.isInteger(definitionId) || definitionId <= 0) {
    return (
      <Problem
        locale={locale}
        t={t}
        message={t.recordNew.invalidId.replace("{id}", id)}
      />
    );
  }

  // Field labels and dropdown option labels come back already resolved for this language, so the
  // generated form below is translated without knowing that translations exist.
  const result = await getDefinition(definitionId, locale);

  if (!result.ok) {
    return (
      <Problem
        locale={locale}
        t={t}
        message={
          result.status === 404
            ? t.recordNew.notFound.replace("{id}", String(definitionId))
            : result.status === 401
              ? t.errors.signIn
              : result.message
        }
      />
    );
  }

  const definition = result.data;
  const fields = definition.fields ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href={`/${locale}`}
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        {t.nav.allSchemas}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {t.recordNew.title.replace("{name}", definition.name)}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {definition.description || t.recordNew.noDescription}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
        {t.recordNew.meta
          .replace("{id}", String(definition.id))
          .replace("{count}", String(fields.length))}
      </p>

      <div className="mt-8">
        {definition.canEdit && <Link className="btn-secondary mb-6" href={`/${locale}/schemas/${definition.id}/edit`}>{t.editing.editDefinition}</Link>}
        <RecordForm locale={locale} t={t.editing} definitionId={definition.id} fields={fields} />
      </div>
    </div>
  );
}

function Problem({
  locale,
  t,
  message,
}: {
  locale: Locale;
  t: Dictionary;
  message: string;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href={`/${locale}`}
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        {t.nav.allSchemas}
      </Link>
      <p className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        {message}
      </p>
    </div>
  );
}
