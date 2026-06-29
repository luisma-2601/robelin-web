import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Ventas del mes (pedidos aprobados)
  const { data: monthOrders } = await supabase
    .from("orders")
    .select("total_usd, total_ves")
    .eq("status", "approved")
    .gte("created_at", startOfMonth);

  const monthlySalesUsd = monthOrders?.reduce((sum, o) => sum + o.total_usd, 0) || 0;
  const monthlySalesVes = monthOrders?.reduce((sum, o) => sum + o.total_ves, 0) || 0;

  // Pedidos pendientes
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("id, total_usd, total_ves, created_at, profiles(name, phone)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const pendingCount = pendingOrders?.length || 0;

  // Productos activos (stock > 0)
  const { count: activeProducts } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .gt("stock", 0);

  // Stock bajo (< 5)
  const { data: lowStockProducts } = await supabase
    .from("products")
    .select("id, name, image_url, stock, price_usd")
    .gt("stock", 0)
    .lt("stock", 5)
    .order("stock", { ascending: true });

  const lowStockCount = lowStockProducts?.length || 0;

  // Ventas de los últimos 7 días
  const days: { label: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString();

    const { data: dayOrders } = await supabase
      .from("orders")
      .select("total_usd")
      .eq("status", "approved")
      .gte("created_at", dayStart)
      .lt("created_at", dayEnd);

    const dayLabel = date.toLocaleDateString("es", { weekday: "short" });
    days.push({ label: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1), total: dayOrders?.reduce((s, o) => s + o.total_usd, 0) || 0 });
  }

  // Top 5 productos más vendidos
  const { data: topProducts } = await supabase
    .from("products")
    .select("id, name, image_url, sales_count, price_usd")
    .order("sales_count", { ascending: false })
    .gt("sales_count", 0)
    .limit(5);

  return (
    <DashboardClient
      monthlySalesUsd={monthlySalesUsd}
      monthlySalesVes={monthlySalesVes}
      pendingCount={pendingCount || 0}
      activeProducts={activeProducts || 0}
      lowStockCount={lowStockCount}
      lowStockProducts={lowStockProducts || []}
      pendingOrders={pendingOrders || []}
      salesByDay={days}
      topProducts={topProducts || []}
    />
  );
}
