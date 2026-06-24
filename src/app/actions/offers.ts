"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOfferAction(data: {
  title: string;
  description: string;
  badge: string;
  color: string;
}) {
  const supabase = createClient();
  const { data: created, error } = await supabase.from("offers").insert({
    title: data.title,
    description: data.description,
    badge: data.badge,
    color: data.color,
    active: true,
  }).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/offers");
  return created;
}

export async function updateOfferAction(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    badge: string;
    color: string;
    active: boolean;
  }>
) {
  const supabase = createClient();
  const { error } = await supabase.from("offers").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/offers");
}

export async function deleteOfferAction(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/offers");
}
