"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { StoreService } from "@/lib/types";

export async function upsertStoreInfoAction(data: {
  about_title: string;
  about_description: string;
  mission: string;
  vision: string;
  services: StoreService[];
}) {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("store_info")
    .select("id")
    .limit(1)
    .single();

  let error;
  if (existing) {
    ({ error } = await supabase
      .from("store_info")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", existing.id));
  } else {
    ({ error } = await supabase.from("store_info").insert(data));
  }

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/store-info");
}
