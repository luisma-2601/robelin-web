import { createClient } from "@/lib/supabase/server";
import OrderList from "./OrderList";

export const revalidate = 0;

export default async function OrdersPage() {
  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, profiles(name, phone, city), order_items(*, products(name, image_url))")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Pedidos</h1>
      <OrderList initialOrders={orders || []} />
    </div>
  );
}
