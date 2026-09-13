"use server";

import { redirect } from "next/navigation";
import { createDefinition } from "@/lib/handytool-api";
import type { ValidationError } from "@/lib/handytool-types";
import { toDefinitionPayload, type SchemaDraft } from "@/lib/schema-draft";

export interface SchemaFormState {
  message: string;
  errors: ValidationError[];
  conflict?: boolean;
  /** The exact JSON that was POSTed, so the page can show what the API received. */
  requestJson: string;
}

export async function createSchemaAction(
  locale: string,
  _previous: SchemaFormState | null,
  draft: SchemaDraft,
): Promise<SchemaFormState> {
  const payload = toDefinitionPayload(draft);
  const requestJson = JSON.stringify(payload, null, 2);

  const result = await createDefinition(payload);

  if (!result.ok) {
    return {
      message: result.message,
      errors: result.problem?.errors ?? [],
      requestJson,
    };
  }

  // The schema exists - go straight to adding an instance of it, staying in the same language.
  redirect(`/${locale}/schemas/${result.data.id}/records/new`);
}
