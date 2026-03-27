"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1, "Requerido"),
  description: z.string().optional(),
  category: z.string().min(1, "Requerido"),
  price_usd: z.number({invalid_type_error: "Requerido"}).min(0),
  stock: z.number({invalid_type_error: "Requerido"}).min(0),
});

type FormData = z.infer<typeof schema>;

export default function NewProduct() {
  const router = useRouter();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

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
        alert("Error subiendo imagen");
        setLoading(false);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      image_url = publicUrl;
    }

    const { error } = await supabase.from('products').insert({
      ...data,
      image_url
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push('/admin/products');
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/products" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 w-fit transition-colors">
        <ArrowLeft size={20} /> Volver a Inventario
      </Link>
      <h1 className="text-3xl font-bold text-white mb-6">Nuevo Producto</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border p-6 rounded-xl">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre</label>
            <input {...register("name")} className="w-full bg-black border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
            {errors.name && <span className="text-red-400 text-xs mt-1 block">{errors.name.message}</span>}
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
            <textarea {...register("description")} className="w-full bg-black border border-border rounded-lg px-4 py-2 text-white h-24 focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Categoría</label>
            <input {...register("category")} className="w-full bg-black border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
            {errors.category && <span className="text-red-400 text-xs mt-1 block">{errors.category.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Imagen (Opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-black hover:file:bg-primaryHover" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Precio USD</label>
            <input type="number" step="0.01" {...register("price_usd", { valueAsNumber: true })} className="w-full bg-black border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
            {errors.price_usd && <span className="text-red-400 text-xs mt-1 block">{errors.price_usd.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Stock Inicial</label>
            <input type="number" {...register("stock", { valueAsNumber: true })} className="w-full bg-black border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary" />
            {errors.stock && <span className="text-red-400 text-xs mt-1 block">{errors.stock.message}</span>}
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-primary text-black font-semibold py-3 rounded-lg hover:bg-primaryHover disabled:opacity-50 mt-4 transition-colors">
          {loading ? "Guardando..." : "Crear Producto"}
        </button>
      </form>
    </div>
  );
}
