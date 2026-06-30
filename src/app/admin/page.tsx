import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
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

  // Ventas aprobadas del último año completo
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const { data: salesOrders } = await supabase
    .from("orders")
    .select("created_at, total_usd")
    .eq("status", "approved")
    .gte("created_at", oneYearAgo.toISOString())
    .order("created_at", { ascending: true });

  // Top 5 productos más vendidos
  const { data: topProducts } = await supabase
    .from("products")
    .select("id, name, image_url, sales_count, price_usd")
    .order("sales_count", { ascending: false })
    .gt("sales_count", 0)
    .limit(5);

  // Top 5 clientes con más compras (service role para saltarse RLS)
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data: topCustomers } = await adminClient
    .from("profiles")
    .select("id, name, cedula, phone, purchase_count")
    .order("purchase_count", { ascending: false })
    .gt("purchase_count", 0)
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
      salesOrders={salesOrders || []}
      topProducts={topProducts || []}
      topCustomers={topCustomers || []}
    />
  );
}
