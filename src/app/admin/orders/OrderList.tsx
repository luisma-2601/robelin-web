"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function OrderList({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const supabase = createClient();

  const handleApprove = async (orderId: string) => {
    const { error } = await supabase.rpc('approve_order', { p_order_id: orderId });
    if (error) {
      alert("Error: " + error.message);
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'approved' } : o));
    }
  };

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-card border border-border p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Pedido #{order.id.split('-')[0]}</h3>
              <p className="text-sm text-gray-400">Cliente: {order.profiles?.name} ({order.profiles?.phone})</p>
              <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {order.status === 'approved' ? 'Aprobado' : 'Pendiente'}
              </span>
              <p className="text-lg font-bold text-primary mt-2">${order.total_usd.toFixed(2)} USD</p>
              <p className="text-sm text-gray-400">Bs. {order.total_ves.toFixed(2)}</p>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Artículos:</h4>
            <ul className="space-y-2">
              {order.order_items.map((item: any) => (
                <li key={item.id} className="text-sm text-gray-400 flex justify-between border-b border-border/50 pb-2 mb-2">
                  <span className="flex items-center gap-2">
                    {item.products?.image_url && <img src={item.products.image_url} alt="" className="w-8 h-8 rounded object-cover" />}
                    {item.quantity}x {item.products?.name}
                  </span>
                  <span>${item.price_usd_at_purchase.toFixed(2)} / c/u</span>
                </li>
              ))}
            </ul>
          </div>
          {order.status === 'pending' && (
            <div className="mt-4 flex justify-end bg-black/20 p-4 -mx-6 -mb-6 rounded-b-xl border-t border-border">
              <button 
                onClick={() => handleApprove(order.id)}
                className="bg-primary text-black px-6 py-2 rounded-lg font-medium hover:bg-primaryHover transition-colors"
              >
                Aprobar y Descontar Stock
              </button>
            </div>
          )}
        </div>
      ))}
      {orders.length === 0 && <p className="text-gray-500 bg-card p-6 rounded-xl border border-border text-center">No hay pedidos registrados.</p>}
    </div>
  );
}
