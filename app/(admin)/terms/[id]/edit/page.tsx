import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TermForm } from "../../_components/term-form";
import { DeleteButton } from "../../../_components/delete-button";
import { deleteTerm } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditTermPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: term, error }, { data: termTypes }] = await Promise.all([
    supabase
      .from("terms")
      .select("id, term, definition, example, priority, term_type_id")
      .eq("id", id)
      .single(),
    supabase.from("term_types").select("id, name").order("name", { ascending: true }),
  ]);

  if (error || !term) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit term</h1>
        <p className="mt-1 text-sm text-gray-600">Update or delete this term.</p>
      </div>

      <TermForm
        termId={String(term.id)}
        termTypes={termTypes ?? []}
        initial={{
          term: term.term ?? "",
          definition: term.definition ?? "",
          example: term.example ?? "",
          priority: term.priority ?? 0,
          term_type_id: term.term_type_id ?? null,
        }}
      />

      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <p className="mt-1 text-xs text-red-700">Permanently delete this term.</p>
        <div className="mt-3">
          <DeleteButton action={deleteTerm.bind(null, String(term.id))} label="Delete term" />
        </div>
      </div>
    </div>
  );
}
