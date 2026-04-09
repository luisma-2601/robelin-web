import { createClient } from "@/lib/supabase/server";

export async function getBcvRate(): Promise<number> {
  const supabase = createClient();
  const { data: settings } = await supabase.from("settings").select("bcv_rate, is_manual_override").eq("id", 1).single();

  // 1. Si está en control manual, siempre devolvemos el valor de la base de datos
  if (settings?.is_manual_override) {
    return settings.bcv_rate || 1;
  }

  // 2. Si es automático, intentamos traer de la API fresca con caché de 1 hora
  try {
    const response = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 3600 } // Cachear por 1 hora en Next.js App Router (ISR)
    });
    
    if (response.ok) {
      const bcvData = await response.json();
      if (bcvData.promedio && !isNaN(bcvData.promedio)) {
        return bcvData.promedio;
      }
    }
  } catch (error) {
    console.error("Error al obtener DolarApi en servidor:", error);
  }

  // 3. Fallback: Base de datos
  return settings?.bcv_rate || 1;
}
