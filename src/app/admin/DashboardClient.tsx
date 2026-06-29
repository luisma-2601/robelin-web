"use client";

import { useState } from "react";
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, Crown, X } from "lucide-react";

interface LowStockProduct {
  id: string;
  name: string;
  image_url: string;
  stock: number;
  price_usd: number;
}

interface PendingOrder {
  id: string;
  total_usd: number;
  total_ves: number;
  created_at: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profiles?: any;
}

interface DashboardProps {
  monthlySalesUsd: number;
  monthlySalesVes: number;
  pendingCount: number;
  activeProducts: number;
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
  pendingOrders: PendingOrder[];
  salesByDay: { label: string; total: number }[];
  topProducts: { id: string; name: string; image_url: string; sales_count: number; price_usd: number }[];
}

export default function DashboardClient({
  monthlySalesUsd,
  monthlySalesVes,
  pendingCount,
  activeProducts,
  lowStockCount,
  lowStockProducts,
  pendingOrders,
  salesByDay,
  topProducts,
}: DashboardProps) {
  const maxSale = Math.max(...salesByDay.map((d) => d.total), 1);
  const totalWeek = salesByDay.reduce((s, d) => s + d.total, 0);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showPending, setShowPending] = useState(false);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>

      {/* Low Stock Modal */}
      {showLowStock && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLowStock(false)} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl p-5 md:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                <h3 className="text-lg font-bold text-white">Productos con Stock Bajo</h3>
              </div>
              <button onClick={() => setShowLowStock(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">${product.price_usd.toFixed(2)}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                      {product.stock} uds.
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No hay productos con stock bajo.</p>
            )}
          </div>
        </div>
      )}

      {/* Pending Orders Modal */}
      {showPending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPending(false)} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl p-5 md:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-yellow-400" />
                <h3 className="text-lg font-bold text-white">Pedidos Pendientes</h3>
              </div>
              <button onClick={() => setShowPending(false)} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            {pendingOrders.length > 0 ? (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium">
                        Orden #{order.id.split("-")[0]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.profiles?.name || "Cliente"} • {new Date(order.created_at).toLocaleDateString("es")}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm text-primary font-bold">${order.total_usd.toFixed(2)}</p>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                        Pendiente
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No hay pedidos pendientes.</p>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={DollarSign}
          label="Ventas del Mes"
          value={`$${monthlySalesUsd.toFixed(2)}`}
          subtitle={`Bs. ${monthlySalesVes.toFixed(2)}`}
          color="text-primary"
          bgColor="bg-primary/10"
          borderColor="border-primary/20"
        />
        <SummaryCard
          icon={ShoppingBag}
          label="Pedidos Pendientes"
          value={String(pendingCount)}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
          borderColor="border-yellow-500/20"
          alert={pendingCount > 0}
          onClick={() => setShowPending(true)}
        />
        <SummaryCard
          icon={Package}
          label="Productos Activos"
          value={String(activeProducts)}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
          borderColor="border-emerald-500/20"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Stock Bajo"
          value={String(lowStockCount)}
          subtitle="Menos de 5 uds."
          color="text-red-400"
          bgColor="bg-red-500/10"
          borderColor="border-red-500/20"
          alert={lowStockCount > 0}
          onClick={() => setShowLowStock(true)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-white">Ventas - Últimos 7 Días</h2>
            </div>
            <span className="text-sm text-gray-500">
              Total: <span className="text-white font-semibold">${totalWeek.toFixed(2)}</span>
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-48 md:h-56">
            {salesByDay.map((day, i) => {
              const height = maxSale > 0 ? (day.total / maxSale) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">
                    {day.total > 0 ? `$${day.total.toFixed(0)}` : ""}
                  </span>
                  <div className="w-full flex justify-center" style={{ height: "100%" }}>
                    <div className="relative w-full max-w-[48px] flex items-end">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          day.total > 0
                            ? "bg-gradient-to-t from-primary/40 to-primary/80"
                            : "bg-white/5"
                        }`}
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Crown size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-white">Top 5 Más Vendidos</h2>
          </div>

          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div key={product.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-white/5 text-gray-500 border border-white/10"
                  }`}>
                    {i + 1}
                  </span>
                  {product.image_url ? (
                    <img src={product.image_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10 shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales_count} vendidos</p>
                  </div>
                  <span className="text-sm text-white font-semibold shrink-0">${product.price_usd.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Crown size={32} className="text-white/10 mb-3" />
              <p className="text-gray-500 text-sm">Sin ventas registradas aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
  bgColor,
  borderColor,
  alert,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  alert?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`${bgColor} border ${borderColor} p-5 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform ${onClick ? "cursor-pointer" : ""}`}
    >
      {alert && (
        <div className="absolute top-3 right-3">
          <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse block" style={{ color: "inherit" }} />
        </div>
      )}
      <div className={`w-10 h-10 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center mb-3`}>
        <Icon size={20} className={color} />
      </div>
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      {onClick && <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest font-medium">Clic para ver detalles</p>}
    </div>
  );
}
