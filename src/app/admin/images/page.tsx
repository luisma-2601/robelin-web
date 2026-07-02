import { createClient } from "@/lib/supabase/server";
import ImageAssigner from "./ImageAssigner";

export const revalidate = 0;

export default async function ImagesPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, image_url, category")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Asignación de Imágenes</h1>
        <p className="text-gray-500 text-sm mt-1">Sube varias fotos a la vez y asígnalas a sus productos.</p>
      </div>
      <ImageAssigner products={products || []} />
    </div>
  );
}
