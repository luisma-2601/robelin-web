import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";

export const revalidate = 60; // Revalidate every minute if not manually overriden

export default async function Home() {
  const supabase = createClient();
  
  // Fetch Settings (BCV Rate) //
  const { data: settings } = await supabase.from("settings").select("bcv_rate").eq("id", 1).single();
  const bcvRate = settings?.bcv_rate || 1;

  // Fetch Products //
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="flex flex-col items-center mb-12 text-center">
        <h1 className="text-5xl md:text-7xl font-sans font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 drop-shadow-sm leading-tight">
          Robelin II
        </h1>
        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          Tasa Oficial BCV: Bs. {bcvRate.toFixed(2)}
        </div>
      </div>

      <HeroCarousel products={products || []} />

      <div id="catalogo" className="pt-4 scroll-mt-24">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} bcvRate={bcvRate} />
            ))}
          </div>
        ) : (
          <div className="w-full text-center py-32 bg-[#111]/50 border border-white/5 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 mb-6 flex items-center justify-center border border-white/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
              <span className="font-serif text-white/50 text-2xl">R</span>
            </div>
            <h2 className="text-2xl font-medium tracking-tight text-white/90 mb-3">Colección en Preparación</h2>
            <p className="text-gray-500 max-w-sm">
              Nuestro catálogo está siendo reabastecido con los mejores productos corporativos. Vuelve pronto para descubrir nuestra nueva línea de cuidado capilar.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
