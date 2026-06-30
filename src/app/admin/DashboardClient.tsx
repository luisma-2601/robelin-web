"use client";

import { useMemo, useState } from "react";
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp, Crown, X, Users } from "lucide-react";

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

interface SalesOrder {
  created_at: string;
  total_usd: number;
}

interface DashboardProps {
  monthlySalesUsd: number;
  monthlySalesVes: number;
  pendingCount: number;
  activeProducts: number;
  lowStockCount: number;
  lowStockProducts: LowStockProduct[];
  pendingOrders: PendingOrder[];
  salesOrders: SalesOrder[];
  topProducts: { id: string; name: string; image_url: string; sales_count: number; price_usd: number }[];
  topCustomers: { id: string; name: string; cedula: string; phone: string; purchase_count: number }[];
}

function maskCedula(cedula?: string) {
  if (!cedula) return "Sin cédula";
  const match = cedula.match(/^([VEGveg]-?)(\d+)$/i);
  if (!match) return cedula.slice(0, 3) + "***";
  const [, prefix, digits] = match;
  return `${prefix.toUpperCase()}${"*".repeat(Math.max(0, digits.length - 3))}${digits.slice(-3)}`;
}

function maskPhone(phone?: string) {
  if (!phone) return "Sin teléfono";
  const digits = phone.replace(/\D/g, "");
  return digits.slice(0, 4) + "*".repeat(Math.max(0, digits.length - 7)) + digits.slice(-3);
}

type ViewMode = "week" | "month";

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function DashboardClient({
  monthlySalesUsd,
  monthlySalesVes,
  pendingCount,
  activeProducts,
  lowStockCount,
  lowStockProducts,
  pendingOrders,
  salesOrders,
  topProducts,
  topCustomers,
}: DashboardProps) {
  const [showLowStock, setShowLowStock] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  // offset: 0 = current week/month, -1 = previous, etc.
  const [offset, setOffset] = useState(0);

  const { salesByDay, chartTitle, isCurrentPeriod } = useMemo(() => {
    const now = new Date();

    if (viewMode === "week") {
      // Monday of current week + offset
      const monday = new Date(now);
      const day = monday.getDay(); // 0=Sun
      const diff = (day === 0 ? -6 : 1 - day);
      monday.setDate(monday.getDate() + diff + offset * 7);
      monday.setHours(0, 0, 0, 0);

      const days: { label: string; total: number }[] = [];
      const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        const dEnd = new Date(d);
        dEnd.setDate(dEnd.getDate() + 1);
        const total = salesOrders
          .filter((o) => { const t = new Date(o.created_at); return t >= d && t < dEnd; })
          .reduce((s, o) => s + o.total_usd, 0);
        days.push({ label: `${dayNames[i]} ${d.getDate()}`, total });
      }

      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);
      const fmt = (d: Date) => `${d.getDate()} ${MONTHS_ES[d.getMonth()].slice(0,3)}`;
      const title = `${fmt(monday)} – ${fmt(sunday)} ${sunday.getFullYear()}`;
      return { salesByDay: days, chartTitle: title, isCurrentPeriod: offset === 0 };
    } else {
      // Month mode
      const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const year = target.getFullYear();
      const month = target.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const days: { label: string; total: number }[] = [];
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const dEnd = new Date(year, month, i + 1);
        const total = salesOrders
          .filter((o) => { const t = new Date(o.created_at); return t >= d && t < dEnd; })
          .reduce((s, o) => s + o.total_usd, 0);
        days.push({ label: String(i), total });
      }

      const title = `${MONTHS_ES[month]} ${year}`;
      return { salesByDay: days, chartTitle: title, isCurrentPeriod: offset === 0 };
    }
  }, [salesOrders, viewMode, offset]);

  const maxSale = Math.max(...salesByDay.map((d) => d.total), 1);
  const totalPeriod = salesByDay.reduce((s, d) => s + d.total, 0);

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

      {/* Sales Chart — fila propia */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <TrendingUp size={18} className="text-primary shrink-0" />
              <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                {(["week","month"] as ViewMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setViewMode(m); setOffset(0); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      viewMode === m ? "bg-primary/15 text-primary" : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {m === "week" ? "Semana" : "Mes"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOffset((o) => o - 1)}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm transition-all"
                >‹</button>
                <span className="text-sm font-medium text-white px-2 min-w-[160px] text-center">{chartTitle}</span>
                <button
                  onClick={() => setOffset((o) => Math.min(o + 1, 0))}
                  disabled={isCurrentPeriod}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >›</button>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              Total: <span className="text-white font-semibold">${totalPeriod.toFixed(2)}</span>
            </span>
          </div>

          <SalesLineChart data={salesByDay} maxSale={maxSale} />
      </div>

      {/* Información relevante: Productos y Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Top Customers */}
        <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <div className="flex flex-col items-center gap-1 mb-8 text-center">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-primary" />
              <h2 className="text-xl font-bold text-white">Top 5 Clientes</h2>
            </div>
            <p className="text-xs text-gray-500">Clientes con más compras aprobadas</p>
          </div>

          {topCustomers.length > 0 ? (
            <div className="flex flex-col gap-3">
              {topCustomers.map((customer, i) => {
                const medals = ["🥇", "🥈", "🥉"];
                const isTop3 = i < 3;
                return (
                  <div
                    key={customer.id}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${
                      i === 0
                        ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(250,204,21,0.08)]"
                        : i === 1
                        ? "bg-white/5 border-white/10"
                        : "bg-white/3 border-white/5"
                    }`}
                  >
                    <span className={`text-2xl w-9 text-center shrink-0 ${!isTop3 ? "text-base" : ""}`}>
                      {isTop3 ? medals[i] : <span className="text-sm font-bold text-gray-500">{i + 1}</span>}
                    </span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                      i === 0 ? "bg-primary/20 text-primary border border-primary/40" : "bg-white/10 text-white border border-white/10"
                    }`}>
                      {(customer.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${i === 0 ? "text-white text-base" : "text-white/90 text-sm"}`}>
                        {customer.name || "Cliente"}
                      </p>
                      <p className="text-sm text-gray-400 truncate">{maskCedula(customer.cedula)} · {maskPhone(customer.phone)}</p>
                    </div>
                    <div className={`flex flex-col items-center shrink-0 px-4 py-2 rounded-xl border ${
                      i === 0 ? "bg-primary/15 border-primary/30" : "bg-white/5 border-white/10"
                    }`}>
                      <span className={`text-xl font-bold leading-none ${i === 0 ? "text-primary" : "text-white"}`}>
                        {customer.purchase_count}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-0.5">
                        {customer.purchase_count === 1 ? "compra" : "compras"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={36} className="text-white/10 mb-3" />
              <p className="text-gray-500 text-sm">Aún no hay compras aprobadas registradas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SalesLineChart({
  data,
  maxSale,
}: {
  data: { label: string; total: number }[];
  maxSale: number;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = 800;
  const height = 200;
  const padTop = 24;
  const padBottom = 8;
  const chartH = height - padTop - padBottom;
  const n = data.length;

  const points = data.map((d, i) => {
    const x = n > 1 ? (i / (n - 1)) * width : width / 2;
    const ratio = maxSale > 0 ? d.total / maxSale : 0;
    const y = padTop + (1 - ratio) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${width} ${height - padBottom} L 0 ${height - padBottom} Z`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ height: "auto", display: "block" }}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="salesAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Líneas guía horizontales */}
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1="0"
            x2={width}
            y1={padTop + r * chartH}
            y2={padTop + r * chartH}
            stroke="#ffffff"
            strokeOpacity="0.06"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#salesAreaFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#facc15"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIdx === i ? 6 : 4}
              fill="#0a0a0a"
              stroke="#facc15"
              strokeWidth="2.5"
              className="transition-all duration-150"
            />
            {/* Área invisible para hover táctil/mouse más ancha que el punto */}
            <rect
              x={n > 1 ? p.x - width / n / 2 : 0}
              y={padTop}
              width={n > 1 ? width / n : width}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
          </g>
        ))}
      </svg>

      {hoverIdx !== null && points[hoverIdx] && (
        <div
          className="absolute -translate-x-1/2 -translate-y-full bg-[#1a1a1a] border border-primary/30 rounded-lg px-3 py-1.5 text-xs shadow-xl pointer-events-none"
          style={{
            left: `${(points[hoverIdx].x / width) * 100}%`,
            top: `${(points[hoverIdx].y / height) * 100}%`,
            marginTop: "-8px",
          }}
        >
          <p className="text-white font-bold">${points[hoverIdx].total.toFixed(2)}</p>
          <p className="text-gray-500">{points[hoverIdx].label}</p>
        </div>
      )}

      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <span
            key={i}
            className={`text-[9px] md:text-xs font-medium whitespace-nowrap ${
              hoverIdx === i ? "text-primary" : "text-gray-400"
            }`}
            style={{ flex: 1, textAlign: i === 0 ? "left" : i === data.length - 1 ? "right" : "center" }}
          >
            {d.label}
          </span>
        ))}
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
