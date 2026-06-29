import { createClient } from "@/lib/supabase/server";
import ProductsTable from "./ProductsTable";
import BulkImport from "./BulkImport";
import NewProductModal from "./NewProductModal";

export const revalidate = 0;

export default async function ProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-white">Inventario</h1>
        <div className="flex items-center gap-3">
          <BulkImport />
          <NewProductModal />
        </div>
      </div>
      <ProductsTable initialProducts={products || []} />
    </div>
  );
}
