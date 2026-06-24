import { createClient } from "@/lib/supabase/server";
import { getBcvRate } from "@/lib/bcv";

import HeroCarousel from "@/components/HeroCarousel";
import Catalog from "@/components/Catalog";
import OffersSection from "@/components/OffersSection";
import AboutSection from "@/components/AboutSection";
import ScheduleSection from "@/components/ScheduleSection";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  const bcvRate = await getBcvRate();

  let isAdmin = false;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role === "admin") isAdmin = true;
  }

  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  const { data: offers } = await supabase.from("offers").select("*").eq("active", true).order("created_at", { ascending: false });

  const { data: storeInfo } = await supabase.from("store_info").select("*").limit(1).single();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-sans font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-6 drop-shadow-sm leading-tight">
          Robelin II
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-6">
          Productos exclusivos para salones de belleza y barberías profesionales
        </p>
        <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(250,204,21,0.2)]">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          Tasa Oficial BCV: Bs. {bcvRate.toFixed(2)}
        </div>
      </div>

      <HeroCarousel products={products || []} />

      <OffersSection offers={offers || []} />

      <div id="catalogo" className="pt-4 scroll-mt-24">
        <Catalog products={products || []} bcvRate={bcvRate} isAdmin={isAdmin} />
      </div>

      <AboutSection info={storeInfo} />

      <ScheduleSection />

      {/* Footer */}
      <footer className="border-t border-white/5 pt-10 pb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#111] border border-white/10 flex items-center justify-center font-serif text-white text-sm">
              R
            </div>
            <span className="text-sm text-gray-500">Robelin II &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#ofertas" className="hover:text-white transition-colors">Ofertas</a>
            <a href="#catalogo" className="hover:text-white transition-colors">Catálogo</a>
            <a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a>
            <a href="#horarios" className="hover:text-white transition-colors">Horarios</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
