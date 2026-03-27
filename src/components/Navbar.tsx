"use client";
import Link from "next/link";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // No renderizar Navbar en el admin panel
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="bg-black/40 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#111] border border-white/10 flex items-center justify-center font-serif text-white text-xl shadow-lg relative overflow-hidden">
              {/* Marble-like subtle effect */}
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-marble.png')] mix-blend-screen"></div>
              <span className="relative z-10">R</span>
            </div>
            <span className="text-xl font-light tracking-[0.2em] text-white">ROBELIN <span className="text-primary text-sm font-semibold">II</span></span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full border border-white/5">
              <ShoppingCart size={20} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.6)]">
                  {itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-4 py-1.5">
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                  <User size={16} /> <span>Perfil</span>
                </Link>
                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="text-sm font-medium bg-primary/10 text-primary border border-primary/30 px-6 py-2 rounded-full hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:border-primary/50 transition-all backdrop-blur-md">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
