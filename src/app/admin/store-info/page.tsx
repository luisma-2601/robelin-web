import { createClient } from "@/lib/supabase/server";
import StoreInfoEditor from "./StoreInfoEditor";

export const revalidate = 0;

export default async function StoreInfoPage() {
  const supabase = createClient();
  const { data: info } = await supabase
    .from("store_info")
    .select("*")
    .limit(1)
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Información de la Tienda</h1>
      <StoreInfoEditor initialInfo={info} />
    </div>
  );
}
