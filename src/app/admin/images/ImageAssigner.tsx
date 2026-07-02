"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, CheckCircle, ImageOff, Search, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateProductAction } from "@/app/actions/products";

const MAX_WIDTH = 1200;
const JPEG_QUALITY = 0.82;

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Compression failed")), "image/jpeg", JPEG_QUALITY);
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface ProductOption {
  id: string;
  name: string;
  image_url: string;
  category: string;
}

interface Assignment {
  file: File;
  preview: string;
  productId: string;
  search: string;
  dropdownOpen: boolean;
}

export default function ImageAssigner({ products }: { products: ProductOption[] }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newAssignments: Assignment[] = Array.from(files)
      .filter(f => f.type.startsWith("image/"))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
        productId: "",
        search: "",
        dropdownOpen: false,
      }));
    setAssignments(prev => [...prev, ...newAssignments]);
    setDone(false);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const removeAssignment = (index: number) => {
    setAssignments(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updateAssignment = (index: number, patch: Partial<Assignment>) => {
    setAssignments(prev => prev.map((a, i) => i === index ? { ...a, ...patch } : a));
  };

  const selectProduct = (index: number, product: ProductOption) => {
    updateAssignment(index, {
      productId: product.id,
      search: product.name,
      dropdownOpen: false,
    });
  };

  const filteredProducts = (search: string) =>
    products.filter(p =>
      !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 8);

  const readyCount = assignments.filter(a => a.productId).length;

  const handleAssign = async () => {
    const ready = assignments.filter(a => a.productId);
    if (ready.length === 0) return;
    setUploading(true);
    setProgress({ done: 0, total: ready.length });

    for (const assignment of ready) {
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
      if (!ALLOWED_TYPES.includes(assignment.file.type)) continue;
      if (assignment.file.size > 5 * 1024 * 1024) continue;

      const fileName = `${crypto.randomUUID()}.jpg`;
      const compressed = await compressImage(assignment.file);

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, compressed, { contentType: "image/jpeg" });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        await updateProductAction(assignment.productId, { image_url: publicUrl });
      }

      setProgress(p => ({ ...p, done: p.done + 1 }));
    }

    setUploading(false);
    setDone(true);
    setAssignments([]);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-white/10 hover:border-primary/40 rounded-2xl p-12 text-center cursor-pointer transition-all group bg-white/[0.02] hover:bg-primary/5"
      >
        <Upload size={36} className="mx-auto text-gray-600 group-hover:text-primary transition-colors mb-3" />
        <p className="text-white font-medium mb-1">Arrastra tus fotos aquí o haz clic para seleccionarlas</p>
        <p className="text-gray-500 text-sm">JPG, PNG o WEBP · Máximo 5MB por imagen · Puedes seleccionar varias a la vez</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={e => addFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Success */}
      {done && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400 font-medium">
            {progress.total} imagen{progress.total !== 1 ? "es" : ""} asignada{progress.total !== 1 ? "s" : ""} correctamente.
          </p>
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="bg-[#111] border border-white/10 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Subiendo imágenes...</span>
            <span className="text-white font-semibold">{progress.done}/{progress.total}</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Grid */}
      {assignments.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              <span className="text-white font-semibold">{assignments.length}</span> foto{assignments.length !== 1 ? "s" : ""} cargada{assignments.length !== 1 ? "s" : ""} ·{" "}
              <span className="text-primary font-semibold">{readyCount}</span> asignada{readyCount !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => { assignments.forEach(a => URL.revokeObjectURL(a.preview)); setAssignments([]); }}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Limpiar todo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assignments.map((assignment, i) => {
              const selected = products.find(p => p.id === assignment.productId);
              const options = filteredProducts(assignment.search);

              return (
                <div key={i} className="bg-[#111] border border-white/5 rounded-2xl group">
                  {/* Photo */}
                  <div className="relative aspect-square bg-black rounded-t-2xl overflow-hidden">
                    <img src={assignment.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeAssignment(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                    {assignment.productId && (
                      <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Product selector */}
                  <div className="p-3 relative">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      <input
                        type="text"
                        value={assignment.search}
                        onChange={e => updateAssignment(i, { search: e.target.value, dropdownOpen: true, productId: e.target.value === assignment.search ? assignment.productId : "" })}
                        onFocus={() => updateAssignment(i, { dropdownOpen: true })}
                        placeholder="Buscar producto..."
                        className="w-full pl-8 pr-7 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <ChevronDown size={13} className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 transition-transform pointer-events-none ${assignment.dropdownOpen ? "rotate-180" : ""}`} />
                    </div>

                    {/* Dropdown */}
                    {assignment.dropdownOpen && options.length > 0 && (
                      <div className="absolute left-3 right-3 top-[calc(100%-4px)] z-20 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        {options.map(product => (
                          <button
                            key={product.id}
                            onClick={() => selectProduct(i, product)}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                          >
                            {product.image_url ? (
                              <img src={product.image_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <ImageOff size={12} className="text-gray-600" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-white truncate">{product.name}</p>
                              <p className="text-[10px] text-gray-500">{product.category}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Close dropdown on outside click overlay */}
                    {assignment.dropdownOpen && (
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => updateAssignment(i, { dropdownOpen: false })}
                      />
                    )}

                    {/* Selected product preview */}
                    {selected && !assignment.dropdownOpen && (
                      <p className="text-[10px] text-gray-500 mt-1.5 truncate px-1">{selected.category}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assign button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleAssign}
              disabled={uploading || readyCount === 0}
              className="bg-primary hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(250,204,21,0.2)] hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload size={18} />
              )}
              {uploading ? "Subiendo..." : `Asignar ${readyCount} imagen${readyCount !== 1 ? "es" : ""}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
