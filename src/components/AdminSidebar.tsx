"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, Package, ShoppingBag, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Inventory", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 h-full flex flex-col justify-between relative overflow-hidden">
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
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 w-full text-left text-sm font-medium mt-4"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
