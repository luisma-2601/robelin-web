"use server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminSupabase } from "@supabase/supabase-js";

function getAdminClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

interface CartItem {
  id: string;
  quantity: number;
}

export async function createOrderAction(cartItems: CartItem[], bcvRate: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  if (!cartItems.length) throw new Error("El carrito está vacío.");
  if (cartItems.some(i => i.quantity < 1 || i.quantity > 100)) throw new Error("Cantidad inválida.");

  // Rate limit: máximo 3 órdenes por usuario en los últimos 5 minutos
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { count: recentOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", fiveMinutesAgo);
  if ((recentOrders ?? 0) >= 3) {
    throw new Error("Estás creando pedidos muy rápido. Espera unos minutos.");
  }

  const admin = getAdminClient();

  // Obtener precios reales de la BD (nunca confiar en los del cliente)
  const ids = cartItems.map(i => i.id);
  const { data: products, error: prodError } = await admin
    .from("products")
    .select("id, price_usd, stock, name")
    .in("id", ids);

  if (prodError || !products) throw new Error("Error verificando productos.");

  // Validar que todos existen, tienen stock y precio válido
  for (const item of cartItems) {
    const product = products.find(p => p.id === item.id);
    if (!product) throw new Error(`Producto no encontrado: ${item.id}`);
    if (product.stock < item.quantity) throw new Error(`Stock insuficiente para: ${product.name}`);
    if (!product.price_usd || product.price_usd <= 0) throw new Error(`Precio inválido para: ${product.name}`);
  }

  // Calcular totales con precios de la BD
  const totalUsd = cartItems.reduce((sum, item) => {
    const p = products.find(p => p.id === item.id)!;
    return sum + p.price_usd * item.quantity;
  }, 0);
  const totalVes = totalUsd * bcvRate;

  // Crear orden
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({ user_id: user.id, total_usd: totalUsd, total_ves: totalVes, status: "pending" })
    .select()
    .single();

  if (orderError || !order) throw new Error("Error creando la orden.");

  // Insertar items con precios reales
  const orderItemsData = cartItems.map(item => {
    const p = products.find(p => p.id === item.id)!;
    return {
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_usd_at_purchase: p.price_usd,
    };
  });

  const { error: itemsError } = await admin.from("order_items").insert(orderItemsData);
  if (itemsError) throw new Error("Error guardando los items de la orden.");

  return {
    orderId: order.id,
    totalUsd,
    totalVes,
    items: cartItems.map(item => ({
      ...item,
      name: products.find(p => p.id === item.id)!.name,
      price_usd: products.find(p => p.id === item.id)!.price_usd,
    })),
  };
}
