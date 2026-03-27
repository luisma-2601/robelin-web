import { createClient } from "@/lib/supabase/server";
import ProductsTable from "./ProductsTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export const revalidate = 0; // Ensure data is fresh

export default async function ProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Inventario</h1>
        <Link href="/admin/products/new" className="bg-primary hover:bg-primaryHover text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Nuevo Producto
        </Link>
      </div>
      <ProductsTable initialProducts={products || []} />
    </div>
  );
}
