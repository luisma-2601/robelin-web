"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Edit2, Save, X, Upload, Trash2 } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { updateProductAction, deleteProductAction } from "@/app/actions/products";
import CustomSelect from "@/components/CustomSelect";
import CustomNumberInput from "@/components/CustomNumberInput";

export default function ProductsTable({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ price_usd: 0, stock: 0, category: "" });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("name-asc");
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleteModalName, setDeleteModalName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({ price_usd: product.price_usd, stock: product.stock, category: product.category });
    setEditFile(null);
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      await deleteProductAction(deleteModalId);
      setProducts(products.filter(p => p.id !== deleteModalId));
      setDeleteModalId(null);
      router.refresh();
    } catch (error: any) {
      console.error("Server Action Error Delete:", error);
      alert("Error eliminando producto: " + error.message);
    }
    setIsDeleting(false);
  };

  const handleSave = async (id: string, currentImageUrl: string) => {
    setIsUploading(true);
    let newImageUrl = currentImageUrl;
    
    if (editFile) {
      const fileExt = editFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, editFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
        newImageUrl = publicUrl;
      } else {
        alert("Error subiendo nueva imagen");
      }
    }

    try {
      await updateProductAction(id, { 
        price_usd: editForm.price_usd, 
        stock: editForm.stock, 
        category: editForm.category, 
        image_url: newImageUrl 
      });
      
      setProducts(products.map(p => p.id === id ? { ...p, ...editForm, image_url: newImageUrl } : p));
      setEditingId(null);
      setEditFile(null);
      router.refresh();
    } catch (error: any) {
      console.error("Server Action Error Update:", error);
      alert("Error guardando producto: " + error.message);
    }
    setIsUploading(false);
  };

  let filteredProducts = products.filter(p => filterCategory === "All" || p.category === filterCategory);

  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      case "price-asc": return a.price_usd - b.price_usd;
      case "price-desc": return b.price_usd - a.price_usd;
      case "stock-asc": return a.stock - b.stock;
      case "stock-desc": return b.stock - a.stock;
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteModalId(null)} />
          <div className="relative bg-[#111] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,1)] rounded-2xl p-8 max-w-sm w-full animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <Trash2 size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Producto?</h3>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Estás a punto de eliminar permanentemente el producto <span className="text-white font-semibold">{deleteModalName}</span>. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setDeleteModalId(null)} 
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmDelete} 
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 flex justify-center items-center"
                >
                  {isDeleting ? <span className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span> : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-4 mb-3">
        <CustomSelect 
          value={sortBy} 
          onChange={setSortBy}
          options={[
            { value: "name-asc", label: "Nombre (A-Z)" },
            { value: "name-desc", label: "Nombre (Z-A)" },
            { value: "price-asc", label: "Precio (Menor a Mayor)" },
            { value: "price-desc", label: "Precio (Mayor a Menor)" },
            { value: "stock-asc", label: "Stock (Menor a Mayor)" },
            { value: "stock-desc", label: "Stock (Mayor a Menor)" }
          ]}
          className="w-56 rounded-full shadow-md z-10"
        />
        <CustomSelect 
          value={filterCategory} 
          onChange={setFilterCategory}
          options={[
            { value: "All", label: "Todas las Categorías" },
            ...PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))
          ]}
          className="w-56 rounded-full shadow-md z-10"
        />
      </div>
      <div className="bg-card border border-white/5 shadow-2xl rounded-2xl overflow-hidden">
      <table className="w-full text-left text-base text-gray-300">
        <thead className="bg-[#0a0a0a] text-gray-400 border-b border-white/5 uppercase tracking-wider text-xs">
          <tr>
            <th className="px-6 py-5 font-semibold">Producto</th>
            <th className="px-6 py-5 font-semibold">Categoría</th>
            <th className="px-6 py-5 font-semibold">Precio (USD)</th>
            <th className="px-6 py-5 font-semibold">Stock</th>
            <th className="px-6 py-5 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {filteredProducts.map((product) => {
            const isEditing = editingId === product.id;
            return (
              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-5 font-medium text-white flex gap-4 items-center text-lg">
                  {isEditing ? (
                    <div className="relative group cursor-pointer w-16 h-16 shrink-0 rounded-xl overflow-hidden shadow-md border-2 border-dashed border-white/20 hover:border-primary/50 transition-colors">
                      <img src={editFile ? URL.createObjectURL(editFile) : product.image_url || "https://placehold.co/100x100"} alt="" className="w-full h-full object-cover opacity-30 transition-opacity group-hover:opacity-10" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <Upload size={18} className="text-white mb-1" />
                        <span className="text-[9px] uppercase font-bold text-white tracking-wider">Subir</span>
                      </div>
                      <input type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  ) : (
                    product.image_url && <img src={product.image_url} alt="" className="w-16 h-16 object-cover rounded-xl shadow-md border border-white/10 shrink-0" />
                  )}
                  <span className="truncate max-w-[200px] xl:max-w-xs">{product.name}</span>
                </td>
                <td className="px-6 py-5">
                  {isEditing ? (
                    <CustomSelect 
                      value={editForm.category} 
                      onChange={(val) => setEditForm({...editForm, category: val})}
                      options={PRODUCT_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                      className="w-48 rounded-xl z-20"
                    />
                  ) : (
                    <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm font-medium">{product.category}</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  {isEditing ? (
                    <CustomNumberInput 
                      value={editForm.price_usd} 
                      onChangeValue={(val) => setEditForm({...editForm, price_usd: Number(val)})} 
                      step={0.01} 
                      min={0}
                      prefixSymbol="$"
                      className="w-32 z-10"
                    />
                  ) : (
                    <span className="font-semibold text-lg text-white">${product.price_usd.toFixed(2)}</span>
                  )}
                </td>
                <td className="px-6 py-5">
                  {isEditing ? (
                    <CustomNumberInput 
                      value={editForm.stock} 
                      onChangeValue={(val) => setEditForm({...editForm, stock: Number(val)})} 
                      step={1} 
                      min={0}
                      className="w-24 z-10"
                    />
                  ) : (
                    <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm border ${product.stock > 0 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {product.stock}
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => setEditingId(null)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-colors shadow-sm"><X size={20} /></button>
                      <button disabled={isUploading} onClick={() => handleSave(product.id, product.image_url)} className="p-2.5 bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-primary transition-all shadow-[0_0_10px_rgba(250,204,21,0.2)]">
                        <Save size={20} className={isUploading ? "animate-pulse" : ""} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setDeleteModalId(product.id); setDeleteModalName(product.name); }} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 rounded-full text-red-500 transition-colors shadow-sm"><Trash2 size={20} /></button>
                      <button onClick={() => handleEdit(product)} className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-full text-gray-300 transition-colors shadow-sm"><Edit2 size={20} /></button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay productos registrados.</td></tr>
          )}
        </tbody>
      </table>
    </div>
    </div>
  );
}
