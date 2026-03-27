"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Edit2, Save, X } from "lucide-react";

export default function ProductsTable({ initialProducts }: { initialProducts: any[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ price_usd: 0, stock: 0 });
  const supabase = createClient();

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setEditForm({ price_usd: product.price_usd, stock: product.stock });
  };

  const handleSave = async (id: string) => {
    const { error } = await supabase
      .from("products")
      .update({ price_usd: editForm.price_usd, stock: editForm.stock })
      .eq("id", id);
      
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, ...editForm } : p));
      setEditingId(null);
    } else {
      alert("Error guardando producto");
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-black text-gray-400 border-b border-border">
          <tr>
            <th className="px-6 py-4 font-medium">Producto</th>
            <th className="px-6 py-4 font-medium">Categoría</th>
            <th className="px-6 py-4 font-medium">Precio (USD)</th>
            <th className="px-6 py-4 font-medium">Stock</th>
            <th className="px-6 py-4 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => {
            const isEditing = editingId === product.id;
            return (
              <tr key={product.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white flex gap-3 items-center">
                  {product.image_url && <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded-md" />}
                  {product.name}
                </td>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4">
                  {isEditing ? (
                    <input type="number" step="0.01" value={editForm.price_usd} onChange={(e) => setEditForm({...editForm, price_usd: Number(e.target.value)})} className="w-24 bg-black border border-border rounded px-2 py-1" />
                  ) : (
                    `$${product.price_usd.toFixed(2)}`
                  )}
                </td>
                <td className="px-6 py-4">
                  {isEditing ? (
                    <input type="number" value={editForm.stock} onChange={(e) => setEditForm({...editForm, stock: Number(e.target.value)})} className="w-20 bg-black border border-border rounded px-2 py-1" />
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${product.stock > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {product.stock}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><X size={16} /></button>
                      <button onClick={() => handleSave(product.id)} className="p-2 hover:bg-primary/20 rounded-lg text-primary"><Save size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(product)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><Edit2 size={16} /></button>
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
  );
}
