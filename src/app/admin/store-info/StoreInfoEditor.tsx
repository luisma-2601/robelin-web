"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Trash2, GripVertical, ChevronDown, Scissors, Sparkles, Star, Heart, ShoppingBag, Tag, Package, Zap, Droplets, Crown, Gem, Palette, Wind, Brush, Users, Award, Clock, Flame, Smile, Shirt, HandHeart, Flower2, Dumbbell, Wand2, ShoppingCart, BadgeCheck, Gift } from "lucide-react";
import { StoreInfo, StoreService } from "@/lib/types";
import { upsertStoreInfoAction } from "@/app/actions/store-info";

const ICON_OPTIONS = [
  { name: "Scissors",    Icon: Scissors,    label: "Tijeras" },
  { name: "Wand2",       Icon: Wand2,       label: "Varita" },
  { name: "Brush",       Icon: Brush,       label: "Brocha" },
  { name: "Palette",     Icon: Palette,     label: "Paleta" },
  { name: "Wind",        Icon: Wind,        label: "Secado" },
  { name: "Droplets",    Icon: Droplets,    label: "Hidrat." },
  { name: "Flower2",     Icon: Flower2,     label: "Flor" },
  { name: "Sparkles",    Icon: Sparkles,    label: "Brillo" },
  { name: "Flame",       Icon: Flame,       label: "Calor" },
  { name: "Smile",       Icon: Smile,       label: "Sonrisa" },
  { name: "Heart",       Icon: Heart,       label: "Cuidado" },
  { name: "HandHeart",   Icon: HandHeart,   label: "Atención" },
  { name: "Crown",       Icon: Crown,       label: "Premium" },
  { name: "Gem",         Icon: Gem,         label: "Lujo" },
  { name: "Star",        Icon: Star,        label: "Calidad" },
  { name: "Award",       Icon: Award,       label: "Premio" },
  { name: "BadgeCheck",  Icon: BadgeCheck,  label: "Garantía" },
  { name: "Shirt",       Icon: Shirt,       label: "Ropa" },
  { name: "ShoppingBag", Icon: ShoppingBag, label: "Compras" },
  { name: "ShoppingCart",Icon: ShoppingCart,label: "Carrito" },
  { name: "Tag",         Icon: Tag,         label: "Precio" },
  { name: "Gift",        Icon: Gift,        label: "Regalo" },
  { name: "Package",     Icon: Package,     label: "Paquete" },
  { name: "Users",       Icon: Users,       label: "Clientes" },
  { name: "Clock",       Icon: Clock,       label: "Horario" },
  { name: "Dumbbell",    Icon: Dumbbell,    label: "Fuerza" },
  { name: "Zap",         Icon: Zap,         label: "Energía" },
];

const DEFAULT_INFO = {
  about_title: "Sobre Nosotros",
  about_description: "",
  mission: "",
  vision: "",
  services: [] as StoreService[],
};

export default function StoreInfoEditor({ initialInfo }: { initialInfo: StoreInfo | null }) {
  const [form, setForm] = useState({
    about_title: initialInfo?.about_title || DEFAULT_INFO.about_title,
    about_description: initialInfo?.about_description || DEFAULT_INFO.about_description,
    mission: initialInfo?.mission || DEFAULT_INFO.mission,
    vision: initialInfo?.vision || DEFAULT_INFO.vision,
    services: initialInfo?.services || DEFAULT_INFO.services,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openIconPicker, setOpenIconPicker] = useState<number | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setIsLoading(true);
    setSaved(false);
    try {
      await upsertStoreInfoAction(form);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : "desconocido"));
    }
    setIsLoading(false);
  };

  const addService = () => {
    setForm({ ...form, services: [...form.services, { title: "", description: "" }] });
  };

  const updateService = (index: number, field: keyof StoreService, value: string) => {
    const updated = [...form.services];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, services: updated });
  };

  const removeService = (index: number) => {
    setForm({ ...form, services: form.services.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* About */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 md:p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">¿Quiénes Somos?</h3>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Título de la sección</label>
          <input
            type="text"
            value={form.about_title}
            onChange={(e) => setForm({ ...form, about_title: e.target.value })}
            placeholder="Sobre Nosotros"
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Descripción</label>
          <textarea
            value={form.about_description}
            onChange={(e) => setForm({ ...form, about_description: e.target.value })}
            placeholder="Cuéntale a tus clientes sobre tu negocio, tu historia, qué los hace especiales..."
            rows={5}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 md:p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">Misión y Visión</h3>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Misión</label>
          <textarea
            value={form.mission}
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
            placeholder="¿Cuál es el propósito de tu negocio?"
            rows={3}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Visión</label>
          <textarea
            value={form.vision}
            onChange={(e) => setForm({ ...form, vision: e.target.value })}
            placeholder="¿A dónde quieres llevar tu negocio?"
            rows={3}
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Services */}
      <div className="bg-card border border-white/10 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Servicios</h3>
          <button
            onClick={addService}
            className="text-sm font-semibold text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

        {form.services.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-6">No hay servicios agregados. Haz clic en &quot;Agregar&quot; para crear uno.</p>
        )}

        <div className="space-y-3">
          {form.services.map((service, i) => {
            const selectedIcon = ICON_OPTIONS.find(o => o.name === service.icon);
            const SelectedIcon = selectedIcon?.Icon;
            return (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <GripVertical size={16} className="text-gray-600 mt-2.5 shrink-0" />
                  <div className="flex-1 space-y-3">
                    {/* Icon picker */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenIconPicker(openIconPicker === i ? null : i)}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          {SelectedIcon ? <SelectedIcon size={13} className="text-primary" /> : <span className="text-gray-600 text-[10px]">?</span>}
                        </div>
                        <span className="text-sm text-gray-400 flex-1 text-left">{selectedIcon?.label || "Seleccionar ícono"}</span>
                        <ChevronDown size={14} className={`text-gray-500 transition-transform ${openIconPicker === i ? "rotate-180" : ""}`} />
                      </button>
                      {openIconPicker === i && (
                        <div className="mt-2 p-2 bg-[#111] border border-white/10 rounded-xl">
                          <div className="grid grid-cols-9 gap-1">
                            {ICON_OPTIONS.map(({ name, Icon, label }) => (
                              <button
                                key={name}
                                type="button"
                                title={label}
                                onClick={() => { updateService(i, "icon", name); setOpenIconPicker(null); }}
                                className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                                  service.icon === name
                                    ? "bg-primary/20 border border-primary/50 text-primary"
                                    : "bg-white/5 border border-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                                }`}
                              >
                                <Icon size={15} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => updateService(i, "title", e.target.value)}
                      placeholder="Nombre del servicio"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    />
                    <textarea
                      value={service.description}
                      onChange={(e) => updateService(i, "description", e.target.value)}
                      placeholder="Describe este servicio..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    onClick={() => removeService(i)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded-lg text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-primary hover:bg-primaryHover text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.3)]"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Guardar Cambios
        </button>
        {saved && (
          <span className="text-emerald-400 text-sm font-medium animate-fade-in">
            ¡Guardado correctamente!
          </span>
        )}
      </div>
    </div>
  );
}
