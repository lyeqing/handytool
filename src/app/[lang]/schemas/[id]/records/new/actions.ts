"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createRecord } from "@/lib/handytool-api";
import type { ValidationError } from "@/lib/handytool-types";
import { defaultLocale, isLocale } from "@/i18n/config";

export interface RecordDraft {
  title: string;
  description: string;
  values: Record<string, unknown>;
  revision?: number;
}
export interface RecordFormState {
  message: string;
  errors: ValidationError[];
  conflict?: boolean;
}
export async function createRecordAction(lang: string, definitionId: number,
  _previous: RecordFormState | null, draft: RecordDraft): Promise<RecordFormState> {
  const locale = isLocale(lang) ? lang : defaultLocale;
  const result = await createRecord(definitionId, {
    title: draft.title, description: draft.description, values: draft.values,
  });
  if (!result.ok) return { message: result.message, errors: result.problem?.errors ?? [] };
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}/records/${result.data.id}`);
}
