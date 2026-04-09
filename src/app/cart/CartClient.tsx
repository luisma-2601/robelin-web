"use client";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CartClient({ bcvRate }: { bcvRate: number }) {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const totalUsd = getTotal();
  const totalVes = totalUsd * bcvRate;

  const handleCheckout = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/auth?redirect=/cart");
      return;
    }

    // Usaremos un try catch por confiabilidad
    try {
      // 1. Crear Orden
      const { data: order, error: orderError } = await supabase.from("orders").insert({
        user_id: session.user.id,
        total_usd: totalUsd,
        total_ves: totalVes,
        status: "pending"
      }).select().single();

      if (orderError) throw orderError;

      // 2. Insertar Items
      const orderItemsData = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_usd_at_purchase: item.price_usd
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsData);
      if (itemsError) throw itemsError;

      // 3. Clear Cart & redirect to WhatsApp
      clearCart();
      const adminPhone = "584120000000"; // Reemplazar con el número real de admin
      let message = `Hola! Quiero confirmar mi pedido #${order.id.split('-')[0]}\n\n`;
      items.forEach(i => {
        message += `${i.quantity}x ${i.name} ($${i.price_usd})\n`;
      });
      message += `\n*Total a pagar: $${totalUsd.toFixed(2)} USD (Bs. ${totalVes.toFixed(2)})*\n\nPor favor indícame los métodos de pago.`;
      
      window.location.href = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      alert("Error procesando tu orden: " + msg);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-card border border-border rounded-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-400 mb-8">Agrega algunos productos exclusivos para continuar.</p>
        <Link href="/" className="inline-block bg-primary/10 text-primary border border-primary/30 font-semibold px-8 py-3 rounded-xl hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all backdrop-blur-md">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Items List */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-card border border-border p-4 rounded-xl flex gap-4 items-center">
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
            ) : (
              <div className="w-20 h-20 bg-black rounded-lg border border-border"></div>
            )}
            
            <div className="flex-grow">
              <h3 className="font-bold text-white">{item.name}</h3>
              <p className="text-primary font-bold mt-1">${item.price_usd.toFixed(2)}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3 bg-black border border-border rounded-lg p-1">
                <button 
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  className="px-2 text-gray-400 hover:text-white"
                >
                  <Minus size={16} />
                </button>
                <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 text-gray-400 hover:text-white"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-xl p-6 sticky top-28">
          <h2 className="text-xl font-bold text-white mb-6">Resumen de Orden</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal (USD)</span>
              <span>${totalUsd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Tasa BCV del día</span>
              <span>Bs. {bcvRate.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-border pt-4 mb-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-bold">Total a Pagar</span>
              <span className="text-2xl font-bold text-primary">${totalUsd.toFixed(2)}</span>
            </div>
            <div className="flex justify-end">
              <span className="text-sm font-medium text-gray-400">Bs. {totalVes.toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-primary/10 text-primary border border-primary/30 font-bold py-4 rounded-xl hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 backdrop-blur-md"
          >
            {loading ? "Procesando..." : (
              <>
                Finalizar Vía WhatsApp <ArrowRight size={20} />
              </>
            )}
          </button>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            Al finalizar, serás redirigido a WhatsApp para confirmar los métodos de pago y de entrega con nuestro equipo.
          </p>
        </div>
      </div>
    </div>
  );
}
