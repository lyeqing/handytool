
import { notFound } from "next/navigation";
import { getDefinitionEditor, listDefinitions } from "@/lib/handytool-api";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale,isLocale } from "@/i18n/config";
import { SchemaBuilder, SchemaPageHeader } from "../../new/schema-builder";

export default async function EditDefinitionPage({params}:{params:Promise<{lang:string;id:string}>}) {
  const {lang,id}=await params;const locale=isLocale(lang)?lang:defaultLocale,t=getDictionary(locale).editing;
  const definitionId=Number(id);if(!Number.isSafeInteger(definitionId)||definitionId<=0)notFound();
  const result=await getDefinitionEditor(definitionId);
  if(!result.ok) {if(result.status===404)notFound();return <main id="main-content" className="p-6" role="alert">{result.status===403?t.forbidden:t.unavailable}</main>;}
  const definitions=await listDefinitions(locale);
  return <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6"><SchemaPageHeader title={t.editDefinition} intro={t.schemaIntro} back={t.back} href={`/${locale}/schemas/${id}/records/new`}/><SchemaBuilder locale={locale} t={t} initial={result.data} definitions={definitions.ok?definitions.data:[]}/></main>;
}
