import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Verifica la identidad a partir del JWT firmado.
 * getClaims() evita una llamada a Auth por cada consulta cuando el proyecto usa
 * signing keys asimétricas, y mantiene la validación criptográfica del token.
 */
export async function getCurrentUserId(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const { data, error } = await supabase.auth.getClaims();
  if (error) return null;
  return data?.claims?.sub ?? null;
}
