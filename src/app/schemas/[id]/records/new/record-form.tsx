"use client";

import { useActionState, useState } from "react";
import {
  numberSetting,
  stringSetting,
  type FieldDefinition,
} from "@/lib/handytool-types";
import { createRecordAction, type RecordFormState } from "./actions";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

export function RecordForm({
  definitionId,
  fields,
}: {
  definitionId: number;
  fields: FieldDefinition[];
}) {
  const [state, formAction, pending] = useActionState<
    RecordFormState | null,
    FormData
  >(createRecordAction.bind(null, definitionId), null);

  const errorsFor = (key: string) =>
    (state?.errors ?? []).filter((error) => error.fieldKey === key);

  const active = fields
    .filter((field) => field.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="flex flex-col gap-6">
      {state && !state.ok && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="font-medium text-red-800 dark:text-red-300">
            {state.message}
          </p>
          {state.errors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-red-700 dark:text-red-400">
              {state.errors.map((error, index) => (
                <li key={index}>
                  <code className="font-mono text-xs">
                    {error.fieldKey || "(document)"}
                  </code>{" "}
                  <span className="text-red-500">[{error.errorCode}]</span>{" "}
                  {error.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {state?.ok && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="font-medium text-emerald-800 dark:text-emerald-300">
            {state.message}
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-white p-3 text-xs text-zinc-700 dark:bg-black dark:text-zinc-300">
            {state.responseJson}
          </pre>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        <section className="grid gap-4 rounded-lg border border-zinc-200 p-4 sm:grid-cols-2 dark:border-zinc-800">
          <div>
            <FieldLabel text="Title" hint="relational column" required />
            <input name="title" className={inputClass} />
            <FieldErrors errors={errorsFor("title")} />
          </div>
          <div>
            <FieldLabel text="Description" hint="relational column" />
            <input name="description" className={inputClass} />
          </div>
        </section>

        <section className="flex flex-col gap-5 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">
            Everything below is stored in one jsonb column, keyed by field key.
          </p>

          {active.map((field) => (
            <div key={field.id}>
              <FieldLabel
                text={field.name}
                hint={`${field.key} · ${field.fieldType}`}
                required={field.isRequired}
              />
              <DynamicInput field={field} />
              {field.description && (
                <p className="mt-1 text-xs text-zinc-500">
                  {field.description}
                </p>
              )}
              <FieldErrors errors={errorsFor(field.key)} />
            </div>
          ))}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {pending ? "Saving…" : "Add instance"}
          </button>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Browser-side validation is intentionally off, so the API is what
            rejects bad input.
          </span>
        </div>
      </form>

      {state && (
        <details className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <summary className="cursor-pointer text-sm text-zinc-600 dark:text-zinc-400">
            values JSON sent to the API
          </summary>
          <pre className="mt-3 overflow-x-auto rounded bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
            {state.valuesJson}
          </pre>
        </details>
      )}
    </div>
  );
}

function FieldLabel({
  text,
  hint,
  required,
}: {
  text: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="mb-1 flex items-baseline gap-2">
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {text}
      </span>
      {required && <span className="text-xs text-red-500">required</span>}
      {hint && (
        <span className="font-mono text-[11px] text-zinc-400">{hint}</span>
      )}
    </label>
  );
}

function FieldErrors({
  errors,
}: {
  errors: { errorCode: string; message: string }[];
}) {
  if (errors.length === 0) return null;

  return (
    <ul className="mt-1 space-y-0.5 text-xs text-red-600 dark:text-red-400">
      {errors.map((error, index) => (
        <li key={index}>
          [{error.errorCode}] {error.message}
        </li>
      ))}
    </ul>
  );
}

function DynamicInput({ field }: { field: FieldDefinition }) {
  const name = `field:${field.key}`;
  const options = field.options.filter((option) => option.isActive);

  switch (field.fieldType) {
    case "LongText":
      return <textarea name={name} rows={3} className={inputClass} />;

    case "Integer":
      return (
        <input
          type="number"
          step={1}
          name={name}
          className={inputClass}
          min={numberSetting(field.settings, "minimum")}
          max={numberSetting(field.settings, "maximum")}
        />
      );

    case "Decimal":
      return (
        <input
          type="number"
          step="any"
          name={name}
          className={inputClass}
          min={numberSetting(field.settings, "minimum")}
          max={numberSetting(field.settings, "maximum")}
        />
      );

    case "Boolean":
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name={name} />
          <span className="text-zinc-500">true / false</span>
        </label>
      );

    case "Date":
      return (
        <input
          type="date"
          name={name}
          className={inputClass}
          min={stringSetting(field.settings, "minimumDate")}
          max={stringSetting(field.settings, "maximumDate")}
        />
      );

    case "DateTime":
      return <input type="datetime-local" name={name} className={inputClass} />;

    case "Range":
      return <RangeInput name={name} field={field} />;

    case "Dropdown":
      return (
        <select name={name} className={inputClass} defaultValue="">
          <option value="">— none —</option>
          {options.map((option) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case "MultiSelect":
      return (
        <div className="flex flex-wrap gap-4">
          {options.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={name} value={option.value} />
              {option.label}
            </label>
          ))}
          {options.length === 0 && (
            <span className="text-xs text-zinc-500">No active options.</span>
          )}
        </div>
      );

    default:
      return <input type="text" name={name} className={inputClass} />;
  }
}

function RangeInput({
  name,
  field,
}: {
  name: string;
  field: FieldDefinition;
}) {
  const min = numberSetting(field.settings, "minimum") ?? 0;
  const max = numberSetting(field.settings, "maximum") ?? 100;
  const step = numberSetting(field.settings, "step") ?? 1;
  const [value, setValue] = useState(min);

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="flex-1"
      />
      <output className="w-10 text-right font-mono text-sm">{value}</output>
    </div>
  );
}
