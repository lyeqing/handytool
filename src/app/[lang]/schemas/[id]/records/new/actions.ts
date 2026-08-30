"use server";

import { createRecord, getDefinition } from "@/lib/handytool-api";
import type { FieldDefinition, ValidationError } from "@/lib/handytool-types";

export interface RecordFormState {
  ok: boolean;
  message: string;
  errors: ValidationError[];
  /** The `values` object exactly as it was sent, so the page can show the JSON. */
  valuesJson: string;
  /** The created record as returned by the API. */
  responseJson: string | null;
}

const FIELD_PREFIX = "field:";

/**
 * Turns flat form strings into correctly typed JSON.
 *
 * The API deliberately does not coerce types (a `"8"` is not accepted for a numeric field), so the
 * conversion has to happen here, driven by the field definitions freshly loaded from the API rather
 * than by anything the browser claims.
 */
function buildValues(
  fields: FieldDefinition[],
  formData: FormData,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const field of fields) {
    if (!field.isActive) continue;

    const name = `${FIELD_PREFIX}${field.key}`;

    if (field.fieldType === "Boolean") {
      // An unchecked checkbox sends nothing, which is a real `false`, not a missing value.
      values[field.key] = formData.get(name) !== null;
      continue;
    }

    if (field.fieldType === "MultiSelect") {
      const selected = formData.getAll(name).map(String);
      // Omit when empty and optional; send [] when required so the API reports it.
      if (selected.length > 0 || field.isRequired) {
        values[field.key] = selected;
      }
      continue;
    }

    const raw = formData.get(name);
    const text = typeof raw === "string" ? raw.trim() : "";

    // Empty optional fields are left out entirely rather than sent as "".
    if (text === "") continue;

    switch (field.fieldType) {
      case "Integer":
      case "Decimal":
      case "Range": {
        const parsed = Number(text);
        // If it is not a number, send the raw string - the API's validation should reject it
        // rather than this layer quietly papering over it.
        values[field.key] = Number.isFinite(parsed) ? parsed : text;
        break;
      }
      case "DateTime": {
        // <input type="datetime-local"> has no offset; interpret it in the server's timezone and
        // send UTC ISO 8601, which is what the API expects.
        const parsed = new Date(text);
        values[field.key] = Number.isNaN(parsed.getTime())
          ? text
          : parsed.toISOString();
        break;
      }
      default:
        values[field.key] = text;
        break;
    }
  }

  return values;
}

export async function createRecordAction(
  definitionId: number,
  _previous: RecordFormState | null,
  formData: FormData,
): Promise<RecordFormState> {
  const definition = await getDefinition(definitionId);

  if (!definition.ok) {
    return {
      ok: false,
      message: definition.message,
      errors: [],
      valuesJson: "{}",
      responseJson: null,
    };
  }

  const values = buildValues(definition.data.fields ?? [], formData);
  const valuesJson = JSON.stringify(values, null, 2);

  const result = await createRecord(definitionId, {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    values,
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.message,
      errors: result.problem?.errors ?? [],
      valuesJson,
      responseJson: null,
    };
  }

  return {
    ok: true,
    message: `Record #${result.data.id} created.`,
    errors: [],
    valuesJson,
    responseJson: JSON.stringify(result.data, null, 2),
  };
}
