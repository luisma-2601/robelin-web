"use client";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";
import { createOrderAction } from "@/app/actions/orders";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowRight, CheckCircle2, XCircle, MessageCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

type CheckoutState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; orderId: string; waUrl: string; totalUsd: number; totalVes: number }
  | { status: "error"; message: string };

export default function CartClient({ bcvRate }: { bcvRate: number }) {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const router = useRouter();
  const supabase = createClient();
  const [checkout, setCheckout] = useState<CheckoutState>({ status: "idle" });

  const totalUsd = getTotal();
  const totalVes = totalUsd * bcvRate;

  const handleCheckout = async () => {
    setCheckout({ status: "loading" });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/auth?redirect=/cart");
      return;
    }

    try {
      const cartPayload = items.map(i => ({ id: i.id, quantity: i.quantity }));
      const order = await createOrderAction(cartPayload);

      const orderCode = order.orderId.split("-")[0].toUpperCase();
      let message = `Hola! Quiero hacer un pedido.\n\n*Código de orden: #${orderCode}*\n\n`;
      order.items.forEach(i => {
        message += `• ${i.quantity}x ${i.name} ($${i.price_usd.toFixed(2)})\n`;
      });
      message += `\n*Total: $${order.totalUsd.toFixed(2)} USD (Bs. ${order.totalVes.toFixed(2)})*\n\nPor favor indícame los métodos de pago y entrega.`;

      clearCart();
      setCheckout({
        status: "success",
        orderId: order.orderId.split("-")[0],
        waUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
        totalUsd: order.totalUsd,
        totalVes: order.totalVes,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setCheckout({ status: "error", message: msg });
    }
  };

  // ── Success state ──
  if (checkout.status === "success") {
    return (
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="bg-[#111] border border-emerald-500/20 rounded-2xl p-8 sm:p-10 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Pedido registrado!</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Tu pedido <span className="text-white font-semibold">#{checkout.orderId}</span> fue creado exitosamente.
              Ahora abre WhatsApp para coordinar el pago y la entrega con nuestro equipo.
            </p>
          </div>

          <div className="bg-black/40 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Total USD</span>
              <span className="text-primary font-bold text-base">${checkout.totalUsd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Total Bs.</span>
              <span>Bs. {checkout.totalVes.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={checkout.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#1fb958] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.5)]"
            >
              <MessageCircle size={20} />
              Abrir WhatsApp
            </a>
            <Link
              href="/"
              className="w-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
            >
              <ShoppingBag size={16} />
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty cart ──
  if (items.length === 0) {
    return (
      <div className="text-center py-20 px-6 sm:px-10 bg-card border border-border rounded-2xl">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-400 mb-8 text-sm sm:text-base">Agrega algunos productos exclusivos para continuar.</p>
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

          {/* Error inline */}
          {checkout.status === "error" && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2">
              <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-400 text-xs leading-relaxed">{checkout.message}</p>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={checkout.status === "loading"}
            className="w-full bg-primary/10 text-primary border border-primary/30 font-bold py-4 rounded-xl hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 backdrop-blur-md"
          >
            {checkout.status === "loading" ? "Procesando..." : (
              <>Finalizar Vía WhatsApp <ArrowRight size={20} /></>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Al finalizar, podrás abrir WhatsApp para confirmar el pago y la entrega con nuestro equipo.
          </p>
        </div>
      </div>
    </div>
  );
}
