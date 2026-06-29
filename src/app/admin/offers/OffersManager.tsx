"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff } from "lucide-react";
import { Offer } from "@/lib/types";
import { createOfferAction, updateOfferAction, deleteOfferAction } from "@/app/actions/offers";

const COLOR_PRESETS = [
  { value: "purple", label: "Púrpura", gradient: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30", dot: "bg-purple-500" },
  { value: "yellow", label: "Dorado", gradient: "from-yellow-500/20 to-amber-600/20", border: "border-yellow-500/30", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", dot: "bg-yellow-500" },
  { value: "green", label: "Verde", gradient: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
  { value: "blue", label: "Azul", gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", dot: "bg-blue-500" },
  { value: "red", label: "Rojo", gradient: "from-red-500/20 to-rose-500/20", border: "border-red-500/30", badge: "bg-red-500/20 text-red-400 border-red-500/30", dot: "bg-red-500" },
  { value: "pink", label: "Rosa", gradient: "from-pink-500/20 to-fuchsia-500/20", border: "border-pink-500/30", badge: "bg-pink-500/20 text-pink-400 border-pink-500/30", dot: "bg-pink-500" },
];

function getColorClasses(color: string) {
  return COLOR_PRESETS.find((c) => c.value === color) || COLOR_PRESETS[0];
}

const EMPTY_FORM = { title: "", description: "", badge: "", color: "purple" };

export default function OffersManager({ initialOffers }: { initialOffers: Offer[] }) {
  const [offers, setOffers] = useState(initialOffers);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    if (!createForm.title || !createForm.description || !createForm.badge) return;
    setIsLoading(true);
    try {
      const newOffer = await createOfferAction(createForm);
      setOffers([newOffer, ...offers]);
      setCreateForm(EMPTY_FORM);
      setShowCreate(false);
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : "desconocido"));
    }
    setIsLoading(false);
  };

  const handleEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setEditForm({ title: offer.title, description: offer.description, badge: offer.badge, color: offer.color });
  };

  const handleSave = async (id: string) => {
    setIsLoading(true);
    try {
      await updateOfferAction(id, editForm);
      setOffers(offers.map((o) => (o.id === id ? { ...o, ...editForm } : o)));
      setEditingId(null);
      router.refresh();
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : "desconocido"));
    }
    setIsLoading(false);
  };

  const handleToggle = async (offer: Offer) => {
    try {
      await updateOfferAction(offer.id, { active: !offer.active });
      setOffers(offers.map((o) => (o.id === offer.id ? { ...o, active: !o.active } : o)));
      router.refresh();
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : "desconocido"));
    }
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setIsLoading(true);
    try {
      await deleteOfferAction(deleteModalId);
      setOffers(offers.filter((o) => o.id !== deleteModalId));
      setDeleteModalId(null);
      router.refresh();
    } catch (e: unknown) {
      alert("Error: " + (e instanceof Error ? e.message : "desconocido"));
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Delete Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isLoading && setDeleteModalId(null)} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20">
                <Trash2 size={28} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Oferta?</h3>
              <p className="text-gray-400 text-sm mb-6">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteModalId(null)} disabled={isLoading} className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-sm">
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={isLoading} className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 font-bold transition-all text-sm flex items-center justify-center">
                  {isLoading ? <span className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={() => setShowCreate(true)}
        className="bg-primary hover:bg-primaryHover text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
      >
        <Plus size={18} /> Nueva Oferta
      </button>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl p-5 md:p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Crear Nueva Oferta</h3>
              <button onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <OfferForm form={createForm} setForm={setCreateForm} />
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowCreate(false); setCreateForm(EMPTY_FORM); }} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 text-sm font-medium flex items-center justify-center gap-2">
                <X size={16} /> Cancelar
              </button>
              <button onClick={handleCreate} disabled={isLoading || !createForm.title || !createForm.description || !createForm.badge} className="flex-1 py-2.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 rounded-xl text-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {isLoading ? <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <><Save size={16} /> Crear</>}
              </button>
            </div>

            {/* Preview */}
            {createForm.title && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Vista previa</p>
                <OfferPreviewCard offer={{ ...createForm, active: true }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offers List */}
      {offers.length === 0 && !showCreate && (
        <div className="text-center py-16 bg-card border border-white/5 rounded-2xl">
          <p className="text-gray-500">No hay ofertas creadas.</p>
        </div>
      )}

      <div className="space-y-4">
        {offers.map((offer) => {
          const isEditing = editingId === offer.id;
          const colors = getColorClasses(offer.color);

          return (
            <div key={offer.id} className={`bg-card border rounded-2xl p-5 md:p-6 transition-all ${offer.active ? "border-white/10" : "border-white/5 opacity-60"}`}>
              {isEditing ? (
                <div className="space-y-4">
                  <OfferForm form={editForm} setForm={setEditForm} />
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setEditingId(null)} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 text-sm font-medium flex items-center justify-center gap-2">
                      <X size={16} /> Cancelar
                    </button>
                    <button onClick={() => handleSave(offer.id)} disabled={isLoading} className="flex-1 py-2.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 rounded-xl text-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                      {isLoading ? <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <><Save size={16} /> Guardar</>}
                    </button>
                  </div>
                  {editForm.title && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">Vista previa</p>
                      <OfferPreviewCard offer={{ ...editForm, active: true }} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Color dot + info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-4 h-4 rounded-full shrink-0 mt-1 ${colors.dot}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-semibold truncate">{offer.title}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${colors.badge}`}>
                          {offer.badge}
                        </span>
                        {!offer.active && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border bg-white/5 text-gray-500 border-white/10">
                            Oculta
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{offer.description}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleToggle(offer)}
                      title={offer.active ? "Ocultar" : "Mostrar"}
                      className={`p-2 rounded-full border transition-colors ${offer.active ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/5 border-white/10 text-gray-500 hover:bg-white/10"}`}
                    >
                      {offer.active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button onClick={() => handleEdit(offer)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-gray-300 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteModalId(offer.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 rounded-full text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OfferForm({
  form,
  setForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: (f: typeof EMPTY_FORM) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Título</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ej: 2x1 en Tintes"
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1 block">Etiqueta (Badge)</label>
          <input
            type="text"
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            placeholder="Ej: Popular, Nuevo, Limitado"
            className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 font-medium mb-1 block">Descripción</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe la oferta..."
          rows={2}
          className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 font-medium mb-2 block">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setForm({ ...form, color: preset.value })}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                form.color === preset.value
                  ? `${preset.badge} shadow-lg`
                  : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${preset.dot}`} />
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OfferPreviewCard({ offer }: { offer: { title: string; description: string; badge: string; color: string; active: boolean } }) {
  const colors = getColorClasses(offer.color);
  return (
    <div className={`bg-gradient-to-br ${colors.gradient} rounded-2xl border ${colors.border} p-5 max-w-sm`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${colors.badge}`}>
          {offer.badge}
        </span>
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{offer.title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{offer.description}</p>
    </div>
  );
}
