import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  // Configuración de Vercel Cron: Verificar Authorization Header (Opcional, pero recomendado)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // 1. Obtener la fila de settings (id = 1)
    const { data: settings, error: fetchError } = await supabase
      .from("settings")
      .select("is_manual_override")
      .eq("id", 1)
      .single();

    if (fetchError) {
      console.error("Error fetching settings:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // 2. Si el control manual está activo, no actualizamos la tasa
    if (settings?.is_manual_override) {
      return NextResponse.json({
        message: "Operación omitida: Control manual de tasa BCV activo.",
      });
    }

    // 3. Obtener la tasa de la API gratuita (DolarApi Vzla Oficial)
    const response = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 0 }, // Forzar que no cachee
    });

    if (!response.ok) {
      throw new Error(`Error en DolarApi: ${response.status} ${response.statusText}`);
    }

    const bcvData = await response.json();
    const newRate = bcvData.promedio;

    if (!newRate || isNaN(newRate)) {
      throw new Error("La API no devolvió una tasa válida.");
    }

    // 4. Actualizar la tabla settings en Supabase
    const { error: updateError } = await supabase
      .from("settings")
      .update({ bcv_rate: newRate })
      .eq("id", 1);

    if (updateError) {
      throw new Error(`Error actualizando tasa en la DB: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Tasa BCV actualizada correctamente",
      rate: newRate,
    });
  } catch (error: unknown) {
    console.error("Error el Cron Job de BCV:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
