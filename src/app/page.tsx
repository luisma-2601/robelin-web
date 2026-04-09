import { createClient } from "@/lib/supabase/server";
import { getBcvRate } from "@/lib/bcv";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import Catalog from "@/components/Catalog";

export const revalidate = 0; // Mantiene el front-end 100% libre de caché antigua

export default async function Home() {
  const supabase = createClient();
  
  // Fetch Settings (BCV Rate) //
  const bcvRate = await getBcvRate();

  // Validate Admin Role //
  let isAdmin = false;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "admin") isAdmin = true;
  }

  // Fetch Products //
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-sans font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 drop-shadow-sm leading-tight">
          Robelin II
        </h1>
        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.2)]">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          Tasa Oficial BCV: Bs. {bcvRate.toFixed(2)}
        </div>
      </div>

      <HeroCarousel products={products || []} />

      <div id="catalogo" className="pt-4 scroll-mt-24">
        <Catalog products={products || []} bcvRate={bcvRate} isAdmin={isAdmin} />
      </div>
    </main>
  );
}
