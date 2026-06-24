import { createClient } from "@/lib/supabase/server";
import OffersManager from "./OffersManager";

export const revalidate = 0;

export default async function OffersPage() {
  const supabase = createClient();
  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Ofertas</h1>
      <OffersManager initialOffers={offers || []} />
    </div>
  );
}
