"use client";
import { useState } from "react";
import { Order, OrderItem } from "@/lib/types";
import { ChevronDown, ChevronUp, CheckCircle, Clock, Search, X, XCircle, AlertTriangle } from "lucide-react";
import { approveOrderAction, rejectOrderAction } from "@/app/actions/products";
import { useRouter } from "next/navigation";

type ConfirmAction = { type: "approve" | "reject"; orderId: string; orderCode: string } | null;

export default function OrderList({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const router = useRouter();

  const handleConfirm = async () => {
    if (!confirm) return;
    const { type, orderId } = confirm;
    setConfirm(null);
    setLoadingId(orderId);
    try {
      if (type === "approve") {
        await approveOrderAction(orderId);
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: "approved" } : o));
      } else {
        await rejectOrderAction(orderId);
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: "rejected" } : o));
      }
      router.refresh();
    } catch (err: unknown) {
      alert("Error: " + (err instanceof Error ? err.message : "desconocido"));
    }
    setLoadingId(null);
  };

  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      order.id.toLowerCase().includes(q) ||
      order.profiles?.name?.toLowerCase().includes(q) ||
      order.profiles?.phone?.toLowerCase().includes(q) ||
      new Date(order.created_at).toLocaleDateString("es").includes(q);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    if (status === "approved") return (
      <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 bg-green-500/10 text-green-400">
        <CheckCircle size={11} /> Aprobado
      </span>
    );
    if (status === "rejected") return (
      <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 bg-red-500/10 text-red-400">
        <XCircle size={11} /> Denegado
      </span>
    );
    return (
      <span className="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 bg-yellow-500/10 text-yellow-400">
        <Clock size={11} /> Pendiente
      </span>
    );
  };

  if (orders.length === 0) {
    return <p className="text-gray-500 bg-card p-6 rounded-xl border border-border text-center max-w-3xl mx-auto">No hay pedidos registrados.</p>;
  }

  return (
    <>
      {/* Modal de confirmación */}
      {confirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setConfirm(null)} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirm.type === "approve" ? "bg-primary/15 border border-primary/30" : "bg-red-500/10 border border-red-500/20"}`}>
              {confirm.type === "approve"
                ? <CheckCircle size={24} className="text-primary" />
                : <AlertTriangle size={24} className="text-red-400" />}
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-1">
              {confirm.type === "approve" ? "¿Aprobar pedido?" : "¿Denegar pedido?"}
            </h3>
            <p className="text-sm text-gray-400 text-center mb-6">
              {confirm.type === "approve"
                ? <>Esto aprobará el pedido <span className="text-white font-semibold">#{confirm.orderCode}</span> y descontará el stock de los productos.</>
                : <>Esto denegará el pedido <span className="text-white font-semibold">#{confirm.orderCode}</span>. El cliente será notificado.</>}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  confirm.type === "approve"
                    ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
                    : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                }`}
              >
                {confirm.type === "approve" ? "Sí, aprobar" : "Sí, denegar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, código o fecha..."
              className="w-full pl-11 pr-9 py-2.5 bg-[#111] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { value: "all", label: "Todos" },
              { value: "pending", label: "Pendientes" },
              { value: "approved", label: "Aprobados" },
              { value: "rejected", label: "Denegados" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                  statusFilter === opt.value
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 && (
          <p className="text-gray-500 bg-card p-6 rounded-xl border border-border text-center text-sm">
            No se encontraron pedidos.
          </p>
        )}

        {filteredOrders.map(order => {
          const isExpanded = expandedId === order.id;
          const isPending = order.status === "pending";
          const isLoading = loadingId === order.id;
          const orderCode = order.id.split("-")[0];

          return (
            <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
              <div
                className="flex items-center justify-between p-4 md:p-5 cursor-pointer md:cursor-default"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-base font-bold text-white truncate">Pedido #{orderCode}</h3>
                    {statusBadge(order.status)}
                  </div>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })}</p>
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
                  <span className="md:hidden text-gray-500">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </div>
              </div>

              <div className={`${isExpanded ? "block" : "hidden"} md:block border-t border-border`}>
                <div className="p-4 md:p-5">
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

                {isPending && (
                  <div className="px-4 pb-4 md:px-5 md:pb-5 flex gap-3">
                    <button
                      onClick={() => setConfirm({ type: "approve", orderId: order.id, orderCode })}
                      disabled={isLoading}
                      className="flex-1 md:flex-none bg-primary/10 text-primary border border-primary/30 px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <><span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Procesando...</>
                      ) : (
                        <><CheckCircle size={16} /> Aprobar</>
                      )}
                    </button>
                    <button
                      onClick={() => setConfirm({ type: "reject", orderId: order.id, orderCode })}
                      disabled={isLoading}
                      className="flex-1 md:flex-none bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-2.5 rounded-xl font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle size={16} /> Denegar
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
