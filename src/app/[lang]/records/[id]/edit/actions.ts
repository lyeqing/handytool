"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getRecord, updateRecord } from "@/lib/handytool-api";
import { getDictionary } from "@/i18n/get-dictionary";
import { defaultLocale, isLocale } from "@/i18n/config";
import type { RecordDraft, RecordFormState } from "../../../schemas/[id]/records/new/actions";

export async function updateRecordAction(lang: string, id: number,
  _previous: RecordFormState | null, draft: RecordDraft): Promise<RecordFormState> {
  const locale = isLocale(lang) ? lang : defaultLocale, t = getDictionary(locale).editing;
  const current = await getRecord(String(id));
  if (!current.ok) return { message: t.unavailable, errors: [] };
  if (!current.data.canEdit) return { message: t.forbidden, errors: [] };
  if (current.data.revision !== draft.revision)
    return { message: t.conflict, errors: [], conflict: true };
  const result = await updateRecord(id, {
    title: draft.title, description: draft.description, values: draft.values,
    revision: draft.revision, visibility: current.data.visibility,
  });
  if (!result.ok) return { message: result.code === "revision_conflict" ? t.conflict : result.message,
    errors: result.problem?.errors ?? [], conflict: result.code === "revision_conflict" };
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}/records/${id}`);
}
