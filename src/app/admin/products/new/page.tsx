"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, X, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/app/actions/products";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import CustomSelect from "@/components/CustomSelect";
import CustomNumberInput from "@/components/CustomNumberInput";

const schema = z.object({
  name: z.string().min(1, "Requerido"),
  description: z.string().optional(),
  category: z.string().min(1, "Requerido"),
  price_usd: z.number().min(0, "Mínimo 0"),
  stock: z.number().min(0, "Mínimo 0"),
});

type FormData = z.infer<typeof schema>;

export default function NewProduct() {
  const router = useRouter();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  
  const selectedCategory = watch("category");
  const price_usd = watch("price_usd");
  const stock = watch("stock");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    let image_url = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) {
        setErrorMessage("Error subiendo imagen");
        setLoading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      image_url = publicUrl;
    }

    try {
      await createProductAction({
        ...data,
        image_url
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(error.message || "Ocurrió un error al crear el producto.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
      <Link href="/admin/products" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 w-fit transition-colors">
        <ArrowLeft size={20} /> Volver a Inventario
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6 text-center">Nuevo Producto</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-5 sm:p-8 md:p-12 rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre</label>
            <input {...register("name")} className="w-full bg-black border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
            {errors.name && <span className="text-red-400 text-xs mt-1 block">{errors.name.message}</span>}
          </div>
          
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
            <textarea {...register("description")} className="w-full bg-black border border-border rounded-lg px-4 py-3 text-white h-24 focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Categoría</label>
            <CustomSelect 
              value={selectedCategory || ""}
              onChange={(val) => setValue("category", val, { shouldValidate: true })}
              options={PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              placeholder="Selecciona una categoría"
              className="w-full rounded-lg"
            />
            {errors.category && <span className="text-red-400 text-xs mt-1 block">{errors.category.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Imagen (Opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-black hover:file:bg-primaryHover" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Precio USD</label>
            <CustomNumberInput 
              value={price_usd !== undefined ? price_usd : ""} 
              onChangeValue={(val) => setValue("price_usd", Number(val), { shouldValidate: true })} 
              step={0.01} 
              min={0}
              prefixSymbol="$"
              className="w-full"
            />
            {errors.price_usd && <span className="text-red-400 text-xs mt-1 block">{errors.price_usd.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Stock Inicial</label>
            <CustomNumberInput 
              value={stock !== undefined ? stock : ""} 
              onChangeValue={(val) => setValue("stock", Number(val), { shouldValidate: true })} 
              step={1} 
              min={0}
              className="w-full"
            />
            {errors.stock && <span className="text-red-400 text-xs mt-1 block">{errors.stock.message}</span>}
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary/10 text-primary border border-primary/30 font-bold tracking-wide py-3 rounded-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] disabled:opacity-50 mt-4 transition-all backdrop-blur-sm">
          {loading ? "Guardando..." : "Crear Producto"}
        </button>
      </form>

      {/* Error Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setErrorMessage(null)} />
          <div className="relative bg-[#111] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,1)] rounded-2xl p-8 max-w-sm w-full animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Error</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                {errorMessage}
              </p>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="w-full py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] flex justify-center items-center"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-[#111] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,1)] rounded-2xl p-8 max-w-sm w-full animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6 border border-green-500/20">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Producto Creado!</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                El producto se ha guardado exitosamente en el inventario.
              </p>
              <button 
                onClick={() => {
                  router.push('/admin/products');
                  router.refresh();
                }} 
                className="w-full py-3 px-4 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-500 font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] flex justify-center items-center"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
