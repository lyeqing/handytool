"use server";
import type { SchemaFormState } from "../../new/actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDefinitionEditor, updateDefinition } from "@/lib/handytool-api";
import { toDefinitionPayload, type SchemaDraft } from "@/lib/schema-draft";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale } from "@/i18n/config";

export async function updateSchemaAction(
  lang: string,
  id: number,
  _previous: SchemaFormState | null,
  draft: SchemaDraft,
): Promise<SchemaFormState> {
  const locale=isLocale(lang)?lang:defaultLocale, t=getDictionary(locale).editing;
  const current=await getDefinitionEditor(id);
  if(!current.ok) return {message:current.status===403?t.forbidden:t.unavailable,errors:[],requestJson:"",conflict:false};
  if(current.data.modifiedDate!==draft.modifiedDate) return {message:t.conflict,errors:[],requestJson:"",conflict:true};
  const payload={definition:toDefinitionPayload(draft),modifiedDate:draft.modifiedDate,isActive:draft.isActive??true};
  const result=await updateDefinition(id,payload);
  if(!result.ok) return {message:result.code==="definition_conflict"?t.conflict:result.message,errors:result.problem?.errors??[],requestJson:"",conflict:result.code==="definition_conflict"};
  revalidatePath(`/${locale}`,"layout");
  redirect(`/${locale}/schemas/${id}/records/new`);
}
