"use client";

import { Percent } from "lucide-react";
import { Offer } from "@/lib/types";

const COLOR_MAP: Record<string, { gradient: string; border: string; badge: string }> = {
  purple: { gradient: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  yellow: { gradient: "from-yellow-500/20 to-amber-600/20", border: "border-yellow-500/30", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  green: { gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  blue: { gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  red: { gradient: "from-red-500/20 to-rose-500/20", border: "border-red-500/30", badge: "bg-red-500/20 text-red-400 border-red-500/30" },
  pink: { gradient: "from-pink-500/20 to-fuchsia-500/20", border: "border-pink-500/30", badge: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
};

function getColors(color: string) {
  return COLOR_MAP[color] || COLOR_MAP.purple;
}

export default function OffersSection({ offers }: { offers: Offer[] }) {
  if (offers.length === 0) return null;

  return (
    <section id="ofertas" className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Percent size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Ofertas Especiales</h2>
          <p className="text-sm text-gray-500">Aprovecha nuestras promociones activas</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 gap-5 ${offers.length === 1 ? "md:grid-cols-1 max-w-md" : offers.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
        {offers.map((offer) => {
          const colors = getColors(offer.color);
          return (
            <div
              key={offer.id}
              className={`relative bg-gradient-to-br ${colors.gradient} rounded-2xl border ${colors.border} p-6 hover:scale-[1.02] transition-all duration-300 group overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-6 h-6" />
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${colors.badge}`}>
                    {offer.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{offer.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{offer.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
