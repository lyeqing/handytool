import Link from "next/link";
import { SchemaBuilder } from "./schema-builder";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/schemas/new">) {
  const { lang } = await params;
  const t = getDictionary(isLocale(lang) ? lang : defaultLocale);

  return { title: `${t.schemaNew.title} · ${t.site.title}` };
}

export default async function NewSchemaPage({
  params,
}: PageProps<"/[lang]/schemas/new">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const t = getDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        href={`/${locale}`}
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        {t.nav.allSchemas}
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {t.schemaNew.title}
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        {t.schemaNew.intro}
      </p>

      <div className="mt-8">
        {/* The builder redirects to the new schema after saving, and needs the locale to stay in
            the same language on the way there. */}
        <SchemaBuilder locale={locale} />
      </div>
    </div>
  );
}
