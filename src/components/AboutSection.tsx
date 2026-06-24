"use client";

import { Store, Target, Eye, Sparkles } from "lucide-react";
import { StoreInfo } from "@/lib/types";

const SERVICE_ICONS = [Sparkles, Target, Eye, Store, Sparkles, Target];

export default function AboutSection({ info }: { info: StoreInfo | null }) {
  if (!info) return null;

  const hasServices = info.services && info.services.length > 0;
  const hasMissionOrVision = info.mission || info.vision;

  return (
    <section id="nosotros" className="scroll-mt-24 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
          <Store size={20} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{info.about_title || "Sobre Nosotros"}</h2>
          <p className="text-sm text-gray-500">Conoce más sobre nuestra tienda</p>
        </div>
      </div>

      {/* About + Mission/Vision */}
      <div className={`grid grid-cols-1 gap-6 ${hasMissionOrVision ? "lg:grid-cols-2" : ""}`}>
        {/* About Description */}
        {info.about_description && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Store size={18} className="text-blue-400" />
              ¿Quiénes Somos?
            </h3>
            <p className="text-gray-400 leading-relaxed whitespace-pre-line">{info.about_description}</p>
          </div>
        )}

        {/* Mission & Vision */}
        {hasMissionOrVision && (
          <div className="space-y-6">
            {info.mission && (
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Target size={18} className="text-emerald-400" />
                  Nuestra Misión
                </h3>
                <p className="text-gray-400 leading-relaxed whitespace-pre-line">{info.mission}</p>
              </div>
            )}
            {info.vision && (
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Eye size={18} className="text-purple-400" />
                  Nuestra Visión
                </h3>
                <p className="text-gray-400 leading-relaxed whitespace-pre-line">{info.vision}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Services */}
      {hasServices && (
        <div>
          <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            Nuestros Servicios
          </h3>
          <div className={`grid grid-cols-1 gap-4 ${info.services.length === 1 ? "sm:grid-cols-1 max-w-md" : info.services.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {info.services.map((service, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <div
                  key={i}
                  className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{service.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
