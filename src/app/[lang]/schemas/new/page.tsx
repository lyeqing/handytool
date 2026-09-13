import { listDefinitions } from "@/lib/handytool-api";

import { SchemaBuilder, SchemaPageHeader } from "./schema-builder";
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

  const definitions = await listDefinitions(locale);
  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <SchemaPageHeader title={t.schemaNew.title} intro={t.schemaNew.intro} back={t.nav.allSchemas} href={`/${locale}`}/>

      <div className="mt-8">
        {/* The builder redirects to the new schema after saving, and needs the locale to stay in
            the same language on the way there. */}
        <SchemaBuilder locale={locale} t={t.editing} definitions={definitions.ok ? definitions.data : []} />
      </div>
    </main>
  );
}
