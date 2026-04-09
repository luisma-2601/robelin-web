import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();

  const sampleProducts = [
    {
      name: "Tratamiento Reparador Hair Perfector No.3",
      description: "Tratamiento concentrado para fortalecer el cabello desde adentro. Reduce el quiebre y mejora visiblemente su apariencia.",
      category: "Cuidado Capilar",
      price_usd: 30.00,
      stock: 50,
      image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Decolorante Premium BlondMe",
      description: "Polvo decolorante premium con tecnología integrada Anti-Metal Bond Protection. Aclara hasta 9 tonos.",
      category: "Coloración",
      price_usd: 45.00,
      stock: 20,
      image_url: "https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Kit Alisado Brasileño Profesional",
      description: "Keratina sin formol que alisa, hidrata y aporta un brillo extremo al cabello hasta por 12 semanas.",
      category: "Tratamientos",
      price_usd: 60.00,
      stock: 15,
      image_url: "https://images.unsplash.com/photo-1544161515-4ab2ce6cd8bc?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Tijeras Profesionales Alemanas 5.5\"",
      description: "Tijeras de corte ergonómicas, fabricadas con aleación de acero inoxidable de alta duración.",
      category: "Herramientas",
      price_usd: 120.00,
      stock: 8,
      image_url: "https://images.unsplash.com/photo-1534241695287-c309391ab288?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Shampoo Matizador Anti-Amarillo",
      description: "Neutraliza los reflejos amarillos indeseados en cabellos rubios, decolorados o con canas.",
      category: "Cuidado Capilar",
      price_usd: 25.00,
      stock: 100,
      image_url: "https://images.unsplash.com/photo-1585232004423-244e0e69000b?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Mascarilla Hidratante Intensiva de Argán",
      description: "Restaura el cabello seco y dañado aportando nutrientes esenciales y brillo espectacular.",
      category: "Cuidado Capilar",
      price_usd: 22.00,
      stock: 35,
      image_url: "https://images.unsplash.com/photo-1556228578-8d89b6acd0d9?auto=format&fit=crop&q=80&w=600"
    }
  ];

  try {
    // Check if products exist to avoid duplicating
    const { data: existing } = await supabase.from("products").select("id").limit(1);
    
    if (existing && existing.length > 0) {
      return NextResponse.json({ message: "La base de datos ya contiene productos. Semilla saltada." });
    }

    const { error } = await supabase.from("products").insert(sampleProducts);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Datos de prueba insertados exitosamente" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
