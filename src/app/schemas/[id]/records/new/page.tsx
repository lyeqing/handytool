import Link from "next/link";
import { getDefinition } from "@/lib/handytool-api";
import { RecordForm } from "./record-form";

export default async function NewRecordPage(
  props: PageProps<"/schemas/[id]/records/new">,
) {
  const { id } = await props.params;
  const definitionId = Number(id);

  if (!Number.isInteger(definitionId) || definitionId <= 0) {
    return <Problem message={`"${id}" is not a valid schema id.`} />;
  }

  const result = await getDefinition(definitionId);

  if (!result.ok) {
    return (
      <Problem
        message={
          result.status === 404
            ? `No schema with id ${definitionId} for this owner.`
            : result.message
        }
      />
    );
  }

  const definition = result.data;
  const fields = definition.fields ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        ← All schemas
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Add a {definition.name}
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {definition.description || "No description."}
      </p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
        Schema #{definition.id} · {fields.length} field
        {fields.length === 1 ? "" : "s"} · the form below is generated from the
        field definitions, not hand-written.
      </p>

      <div className="mt-8">
        <RecordForm definitionId={definition.id} fields={fields} />
      </div>
    </div>
  );
}

function Problem({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        ← All schemas
      </Link>
      <p className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        {message}
      </p>
    </div>
  );
}
