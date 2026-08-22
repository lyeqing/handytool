import Link from "next/link";
import { SchemaBuilder } from "./schema-builder";

export const metadata = {
  title: "Create a schema · HandyTool",
};

export default function NewSchemaPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
      >
        ← All schemas
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Create a schema
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        This designs an <code className="font-mono">ObjectDefinition</code> and
        its fields. No table and no C# class is created — the schema is just
        metadata rows, and every record you add later lands in the shared{" "}
        <code className="font-mono">ObjectRecords</code> table as jsonb. The form
        is pre-filled with a Customer example; edit or delete anything.
      </p>

      <div className="mt-8">
        <SchemaBuilder />
      </div>
    </div>
  );
}
