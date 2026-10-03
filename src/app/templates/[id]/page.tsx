import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlannerDocument } from "@/features/templates/queries";
import { PlannerEditor } from "@/features/templates/PlannerEditor";

export default async function PlannerDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/login");

  const { id } = await params;
  const document = await getPlannerDocument(id);
  if (!document) notFound();

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 lg:px-8 lg:py-8">
      <PlannerEditor document={document} />
    </main>
  );
}
