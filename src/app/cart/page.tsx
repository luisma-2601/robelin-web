import { createClient } from "@/lib/supabase/server";
import CartClient from "./CartClient";

export const revalidate = 60; // Refresh exchange rate data every minute minimum

export default async function CartPage() {
  const supabase = createClient();
  const { data: settings } = await supabase.from("settings").select("bcv_rate").eq("id", 1).single();
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight text-white mb-8">Tu Carrito</h1>
      <CartClient bcvRate={settings?.bcv_rate || 1} />
    </main>
  );
}
