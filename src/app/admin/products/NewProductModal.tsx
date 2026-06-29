"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Save, AlertCircle, CheckCircle } from "lucide-react";
import { createProductAction } from "@/app/actions/products";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import CustomSelect from "@/components/CustomSelect";
import CustomNumberInput from "@/components/CustomNumberInput";

export default function NewProductModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priceUsd, setPriceUsd] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setPriceUsd(0);
    setStock(0);
    setFile(null);
    setError(null);
    setSuccess(false);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!name || !category) {
      setError("Nombre y categoría son obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);

    let image_url = null;
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, file);
      if (uploadError) {
        setError("Error subiendo imagen");
        setLoading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
      image_url = publicUrl;
    }

    try {
      await createProductAction({ name, description, category, price_usd: priceUsd, stock, image_url });
      setSuccess(true);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-primary hover:bg-primaryHover text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
        <Plus size={18} /> Nuevo Producto
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !loading && closeModal()} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl p-5 md:p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl space-y-5">
        {/* Success state */}
        {success ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-5 border border-green-500/20">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¡Producto Creado!</h3>
            <p className="text-gray-400 text-sm mb-6">El producto se ha guardado exitosamente en el inventario.</p>
            <div className="flex gap-3 w-full">
              <button onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors text-sm">
                Cerrar
              </button>
              <button onClick={() => { resetForm(); }} className="flex-1 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold hover:bg-primary/20 transition-colors text-sm">
                Crear Otro
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Nuevo Producto</h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-sm text-red-400">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Nombre *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del producto" className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent" />
              </div>

              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción del producto..." rows={2} className="w-full px-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Categoría *</label>
                  <CustomSelect value={category} onChange={setCategory} options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))} placeholder="Seleccionar" className="w-full rounded-xl z-20" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Imagen</label>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-xs text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary file:text-black hover:file:bg-primaryHover" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Precio USD</label>
                  <CustomNumberInput value={priceUsd} onChangeValue={(val) => setPriceUsd(Number(val))} step={0.01} min={0} prefixSymbol="$" className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">Stock</label>
                  <CustomNumberInput value={stock} onChangeValue={(val) => setStock(Number(val))} step={1} min={0} className="w-full" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 text-sm font-medium flex items-center justify-center gap-2">
                <X size={16} /> Cancelar
              </button>
              <button onClick={handleSubmit} disabled={loading || !name || !category} className="flex-1 py-2.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 rounded-xl text-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {loading ? <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <><Save size={16} /> Crear Producto</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
