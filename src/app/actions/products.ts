"use server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Product } from "@/lib/types";

async function assertAdmin() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Acceso denegado: se requiere rol de administrador.");
}

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
  await assertAdmin();
  const supabase = getAdminClient();
  const { error, data } = await supabase.from("products").update(updates).eq("id", id).select();
  
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Fallo crítico: El producto no existe o fue bloqueado por RLS (Filas afectadas: 0).");
  
  revalidatePath("/", "layout"); // Purge cache everywhere
  return true;
}

export async function deleteProductAction(id: string) {
  await assertAdmin();
  const supabase = getAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/", "layout"); // Purge cache everywhere
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createProductAction(productData: any) {
  await assertAdmin();
  const supabase = getAdminClient();
  const { error } = await supabase.from("products").insert(productData);
  if (error) throw new Error(error.message);
  
  revalidatePath("/", "layout");
  return true;
}

export async function bulkCreateProductsAction(
  products: { name: string; description: string; category: string; price_usd: number; stock: number }[]
) {
  await assertAdmin();
  const supabase = getAdminClient();
  const { data, error } = await supabase.from("products").insert(products).select();
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return data?.length || 0;
}

export async function approveOrderAction(orderId: string) {
  await assertAdmin();
  const supabase = getAdminClient();

  // 1. Update order status
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .update({ status: "approved" })
    .eq("id", orderId)
    .select("user_id")
    .single();
  if (orderError) throw new Error(orderError.message);

  // 1b. Incrementar el contador de compras del cliente
  if (order?.user_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("purchase_count")
      .eq("id", order.user_id)
      .single();

    await supabase
      .from("profiles")
      .update({ purchase_count: (profile?.purchase_count || 0) + 1 })
      .eq("id", order.user_id);
  }

  // 2. Get order items
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);
  if (itemsError || !items) throw new Error(itemsError?.message || "Error fetching items");

  // 3. Decrement stock and increment sales_count
  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock, sales_count")
      .eq("id", item.product_id)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({
          stock: Math.max(0, (product.stock || 0) - item.quantity),
          sales_count: (product.sales_count || 0) + item.quantity,
        })
        .eq("id", item.product_id);
    }
  }

  revalidatePath("/", "layout");
  return true;
}

export async function incrementProductSalesAction(orderId: string) {
  await assertAdmin();
  const supabase = getAdminClient();
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);
    
  if (itemsError || !items) throw new Error(itemsError?.message || "Error fetching items");

  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("sales_count")
      .eq("id", item.product_id)
      .single();
      
    const currentSales = product?.sales_count || 0;
    
    await supabase
      .from("products")
      .update({ sales_count: currentSales + item.quantity })
      .eq("id", item.product_id);
  }
  
  revalidatePath("/", "layout");
  return true;
}
