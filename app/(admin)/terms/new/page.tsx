import { createClient } from "@/lib/supabase/server";
import { TermForm } from "../_components/term-form";

export const dynamic = "force-dynamic";

export default async function NewTermPage() {
  const supabase = await createClient();
  const { data: termTypes } = await supabase
    .from("term_types")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New term</h1>
        <p className="mt-1 text-sm text-gray-600">Add a glossary term.</p>
      </div>
      <TermForm termTypes={termTypes ?? []} />
    </div>
  );
}