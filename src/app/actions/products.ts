"use server";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { Product } from "@/lib/types";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false }
    }
  );
}

export async function updateProductAction(id: string, updates: Partial<Product>) {
  const supabase = getAdminClient();
  const { error, data } = await supabase.from("products").update(updates).eq("id", id).select();
  
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Fallo crítico: El producto no existe o fue bloqueado por RLS (Filas afectadas: 0).");
  
  revalidatePath("/", "layout"); // Purge cache everywhere
  return true;
}

export async function deleteProductAction(id: string) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/", "layout"); // Purge cache everywhere
  return true;
}
