"use client";

import { useActionState, useRef, useState } from "react";
import { FIELD_TYPES, hasOptions, type FieldType } from "@/lib/handytool-types";
import {
  customerSchemaDraft,
  emptyField,
  type DraftField,
  type DraftOption,
  type SchemaDraft,
} from "@/lib/schema-draft";
import { createSchemaAction, type SchemaFormState } from "./actions";

const label = "block text-xs font-medium text-zinc-500 dark:text-zinc-400";
const input =
  "w-full rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

/** Deterministic ids for the seeded draft so server and client render identically. */
function seedUid() {
  let n = 0;
  return () => `seed-${++n}`;
}

export function SchemaBuilder() {
  const [state, submit, pending] = useActionState<
    SchemaFormState | null,
    SchemaDraft
  >(createSchemaAction, null);

  const [draft, setDraft] = useState<SchemaDraft>(() =>
    customerSchemaDraft(seedUid()),
  );

  const counter = useRef(0);
  const uid = () => `new-${++counter.current}`;

  function updateField(fieldUid: string, patch: Partial<DraftField>) {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.uid === fieldUid ? { ...field, ...patch } : field,
      ),
    }));
  }

  function updateOption(
    fieldUid: string,
    optionUid: string,
    patch: Partial<DraftOption>,
  ) {
    setDraft((current) => ({
      ...current,
      fields: current.fields.map((field) =>
        field.uid === fieldUid
          ? {
              ...field,
              options: field.options.map((option) =>
                option.uid === optionUid ? { ...option, ...patch } : option,
              ),
            }
          : field,
      ),
    }));
  }

  const errorsFor = (key: string) =>
    (state?.errors ?? []).filter((error) => error.fieldKey === key);

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit(draft);
      }}
    >
      {state && (
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
                  <span className="text-red-500 dark:text-red-500">
                    [{error.errorCode}]
                  </span>{" "}
                  {error.message}
                </li>
              ))}
            </ul>
          )}
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-red-700 dark:text-red-400">
              Request body sent to the API
            </summary>
            <pre className="mt-2 overflow-x-auto rounded bg-white p-3 text-xs text-zinc-700 dark:bg-black dark:text-zinc-300">
              {state.requestJson}
            </pre>
          </details>
        </div>
      )}

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="schema-name">
              Schema name
            </label>
            <input
              id="schema-name"
              className={input}
              value={draft.name}
              onChange={(event) =>
                setDraft({ ...draft, name: event.target.value })
              }
              placeholder="Customer"
            />
          </div>
          <div>
            <label className={label} htmlFor="schema-description">
              Description
            </label>
            <input
              id="schema-description"
              className={input}
              value={draft.description}
              onChange={(event) =>
                setDraft({ ...draft, description: event.target.value })
              }
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        {draft.fields.map((field, index) => (
          <FieldCard
            key={field.uid}
            field={field}
            index={index}
            errors={errorsFor(field.key)}
            onChange={(patch) => updateField(field.uid, patch)}
            onRemove={() =>
              setDraft({
                ...draft,
                fields: draft.fields.filter((f) => f.uid !== field.uid),
              })
            }
            onAddOption={() =>
              updateField(field.uid, {
                options: [
                  ...field.options,
                  { uid: uid(), value: "", label: "" },
                ],
              })
            }
            onChangeOption={(optionUid, patch) =>
              updateOption(field.uid, optionUid, patch)
            }
            onRemoveOption={(optionUid) =>
              updateField(field.uid, {
                options: field.options.filter((o) => o.uid !== optionUid),
              })
            }
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          onClick={() =>
            setDraft({ ...draft, fields: [...draft.fields, emptyField(uid())] })
          }
        >
          + Add field
        </button>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Creating…" : "Create schema"}
        </button>

        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          POSTs to <code className="font-mono">/api/object-definitions</code>,
          then jumps to the add-instance page.
        </span>
      </div>
    </form>
  );
}

function FieldCard({
  field,
  index,
  errors,
  onChange,
  onRemove,
  onAddOption,
  onChangeOption,
  onRemoveOption,
}: {
  field: DraftField;
  index: number;
  errors: { errorCode: string; message: string }[];
  onChange: (patch: Partial<DraftField>) => void;
  onRemove: () => void;
  onAddOption: () => void;
  onChangeOption: (optionUid: string, patch: Partial<DraftOption>) => void;
  onRemoveOption: (optionUid: string) => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">
          Field {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-zinc-500 hover:text-red-600 dark:text-zinc-400"
        >
          Remove
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className={label}>Key (stored in JSON)</label>
          <input
            className={`${input} font-mono`}
            value={field.key}
            onChange={(event) => onChange({ key: event.target.value })}
            placeholder="fullName"
          />
        </div>
        <div>
          <label className={label}>Label (shown to users)</label>
          <input
            className={input}
            value={field.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Full Name"
          />
        </div>
        <div>
          <label className={label}>Type</label>
          <select
            className={input}
            value={field.fieldType}
            onChange={(event) =>
              onChange({ fieldType: event.target.value as FieldType })
            }
          >
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.isRequired}
              onChange={(event) => onChange({ isRequired: event.target.checked })}
            />
            Required
          </label>
        </div>
      </div>

      <FieldSettings field={field} onChange={onChange} />

      {hasOptions(field.fieldType) && (
        <div className="mt-4 rounded-md bg-zinc-50 p-3 dark:bg-zinc-900/60">
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Options — the <code className="font-mono">value</code> is stored in
            record JSON, the label is only for display.
          </p>
          <div className="flex flex-col gap-2">
            {field.options.map((option) => (
              <div key={option.uid} className="flex items-center gap-2">
                <input
                  className={`${input} font-mono`}
                  value={option.value}
                  onChange={(event) =>
                    onChangeOption(option.uid, { value: event.target.value })
                  }
                  placeholder="gold"
                />
                <input
                  className={input}
                  value={option.label}
                  onChange={(event) =>
                    onChangeOption(option.uid, { label: event.target.value })
                  }
                  placeholder="Gold"
                />
                <button
                  type="button"
                  onClick={() => onRemoveOption(option.uid)}
                  className="shrink-0 px-2 text-xs text-zinc-500 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAddOption}
            className="mt-2 text-xs font-medium text-zinc-600 hover:underline dark:text-zinc-300"
          >
            + Add option
          </button>
        </div>
      )}

      {errors.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-red-600 dark:text-red-400">
          {errors.map((error, i) => (
            <li key={i}>
              [{error.errorCode}] {error.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FieldSettings({
  field,
  onChange,
}: {
  field: DraftField;
  onChange: (patch: Partial<DraftField>) => void;
}) {
  const numberBox = (
    key: "minimumLength" | "maximumLength" | "minimum" | "maximum" | "step",
    text: string,
  ) => (
    <div>
      <label className={label}>{text}</label>
      <input
        type="number"
        className={input}
        value={field[key]}
        onChange={(event) => onChange({ [key]: event.target.value })}
      />
    </div>
  );

  const dateBox = (key: "minimumDate" | "maximumDate", text: string) => (
    <div>
      <label className={label}>{text}</label>
      <input
        type="date"
        className={input}
        value={field[key]}
        onChange={(event) => onChange({ [key]: event.target.value })}
      />
    </div>
  );

  let boxes: React.ReactNode = null;

  switch (field.fieldType) {
    case "Text":
    case "LongText":
      boxes = (
        <>
          {numberBox("minimumLength", "minimumLength")}
          {numberBox("maximumLength", "maximumLength")}
        </>
      );
      break;
    case "Integer":
    case "Decimal":
      boxes = (
        <>
          {numberBox("minimum", "minimum")}
          {numberBox("maximum", "maximum")}
        </>
      );
      break;
    case "Range":
      boxes = (
        <>
          {numberBox("minimum", "minimum")}
          {numberBox("maximum", "maximum")}
          {numberBox("step", "step")}
        </>
      );
      break;
    case "Date":
      boxes = (
        <>
          {dateBox("minimumDate", "minimumDate")}
          {dateBox("maximumDate", "maximumDate")}
        </>
      );
      break;
    default:
      return null;
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs text-zinc-400">
        settings (stored as jsonb on the field definition)
      </p>
      <div className="grid gap-4 sm:grid-cols-4">{boxes}</div>
    </div>
  );
}
