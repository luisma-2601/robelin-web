"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Package, ShoppingBag, LogOut, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Inventario", icon: Package },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/settings", label: "Config", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      {/* ========= DESKTOP SIDEBAR (hidden on mobile) ========= */}
      <aside className="hidden md:flex w-64 bg-[#0a0a0a] border-r border-white/5 h-full flex-col justify-between relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-[50px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="p-8 pb-4">
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center font-serif text-white text-sm bg-gradient-to-br from-[#2a2a2a] to-[#111]">
                R
              </div>
              <span className="text-sm font-light tracking-[0.2em] text-white">ROBELIN <span className="text-primary font-semibold">II</span></span>
            </Link>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4 font-semibold">Command Center</p>
          </div>
          
          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                    isActive
                      ? "bg-white/10 text-white border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} className={isActive ? "text-primary" : ""} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 relative z-10 border-t border-white/5 mt-auto">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 w-full text-left text-sm font-medium">
            <Home size={16} />
            <span>Ver Tienda</span>
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 w-full text-left text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ========= MOBILE BOTTOM NAV BAR ========= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 flex items-stretch safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />}
            </Link>
          );
        })}
        {/* Logout as last item */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-1 text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Salir</span>
        </button>
      </nav>

      {/* Mobile top header bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center font-serif text-white text-xs bg-gradient-to-br from-[#2a2a2a] to-[#111]">
            R
          </div>
          <span className="text-sm font-light tracking-widest text-white">ROBELIN <span className="text-primary font-semibold">II</span></span>
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Admin</span>
      </header>

      {/* Logout Confirmation Modal */}
      {mounted && showLogoutModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Cerrar Sesión</h3>
            <p className="text-gray-400 text-sm mb-6">¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-500 text-sm font-medium transition-colors border border-red-500/30"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
