"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Order, OrderItem } from "@/lib/types";
import { ChevronDown, ChevronUp, CheckCircle, Clock } from "lucide-react";

export default function OrderList({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  const handleApprove = async (orderId: string) => {
    const { error } = await supabase.rpc('approve_order', { p_order_id: orderId });
    if (error) {
      alert("Error: " + error.message);
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'approved' } : o));
    }
  };

  if (orders.length === 0) {
    return (
      <p className="text-gray-500 bg-card p-6 rounded-xl border border-border text-center">
        No hay pedidos registrados.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const isExpanded = expandedId === order.id;
        const isApproved = order.status === 'approved';

        return (
          <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
            {/* Header — always visible, collapsible on mobile */}
            <div
              className="flex items-center justify-between p-4 md:p-6 cursor-pointer md:cursor-default"
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-base font-bold text-white truncate">Pedido #{order.id.split('-')[0]}</h3>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${isApproved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                    {isApproved ? <CheckCircle size={11}/> : <Clock size={11}/>}
                    {isApproved ? 'Aprobado' : 'Pendiente'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                {order.profiles && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.profiles.name} · {order.profiles.phone}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 ml-3 shrink-0">
                <div className="text-right">
                  <p className="text-base font-bold text-primary">${order.total_usd.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Bs. {order.total_ves.toFixed(2)}</p>
                </div>
                {/* Expand toggle — only visible on mobile */}
                <span className="md:hidden text-gray-500">
                  {isExpanded ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </span>
              </div>
            </div>

            {/* Items + actions — always shown on desktop, collapsible on mobile */}
            <div className={`${isExpanded ? 'block' : 'hidden'} md:block border-t border-border`}>
              <div className="p-4 md:p-6">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Artículos</h4>
                <ul className="space-y-2">
                  {order.order_items.map((item: OrderItem) => (
                    <li key={item.id} className="text-sm text-gray-300 flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                      <span className="flex items-center gap-3">
                        {item.products?.image_url && (
                          <img src={item.products.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0" />
                        )}
                        <span className="font-medium">
                          <span className="text-gray-500">{item.quantity}× </span>
                          {item.products?.name}
                        </span>
                      </span>
                      <span className="text-primary font-semibold">${item.price_usd_at_purchase.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {!isApproved && (
                <div className="px-4 pb-4 md:px-6 md:pb-6">
                  <button 
                    onClick={() => handleApprove(order.id)}
                    className="w-full md:w-auto bg-primary/10 text-primary border border-primary/30 px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] transition-all"
                  >
                    Aprobar y Descontar Stock
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
