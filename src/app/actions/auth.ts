"use server";
import { createAdminClient } from "@/lib/supabase/server";

export async function createProfile(id: string, name: string, phone: string, city: string, email: string) {
  const supabase = createAdminClient(); // Usamos la clave de servicio para evadir temporalmente RLS en el registro initial
  
  const { error } = await supabase.from("profiles").insert({
    id, 
    name, 
    phone, 
    city, 
    email
  });
  
  if (error) {
    console.error("Error creating profile:", error);
    if (error.code === "23503" || error.code === "23505") {
      return { error: "Este correo electrónico ya se encuentra registrado. Por favor, inicia sesión." };
    }
    return { error: "Tuvimos un inconveniente al configurar tu cuenta. Por favor, intenta de nuevo." };
  }
  
  return { success: true };
}
