"use server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const profileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100).trim(),
  phone: z.string().min(7).max(20).trim(),
  city: z.string().min(2).max(100).trim(),
  email: z.string().email().max(254).trim().toLowerCase(),
  cedula: z.string().regex(/^[VEGveg]-?\d{1,8}$/, "Formato inválido (ej: V-12345678)").trim().toUpperCase(),
});

export async function createProfile(id: string, name: string, phone: string, city: string, email: string, cedula: string) {
  const parsed = profileSchema.safeParse({ id, name, phone, city, email, cedula });
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message || "Datos de registro inválidos.";
    return { error: msg };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").insert(parsed.data);

  if (error) {
    console.error("Error creating profile:", error);
    if (error.code === "23503" || error.code === "23505") {
      return { error: "Este correo electrónico ya se encuentra registrado. Por favor, inicia sesión." };
    }
    return { error: "Tuvimos un inconveniente al configurar tu cuenta. Por favor, intenta de nuevo." };
  }

  return { success: true };
}
