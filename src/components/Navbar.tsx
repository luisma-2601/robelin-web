"use client";
import Link from "next/link";
import { ShoppingCart, User, LogOut, Star } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const supabase = createClient();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        if (profile?.role === "admin") setIsAdmin(true);
      }
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
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.6)]">
                  {itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-full px-4 py-1.5">
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                  <User size={16} /> <span>Perfil</span>
                </Link>
                {isAdmin && (
                  <>
                    <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                    <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1 text-sm font-bold tracking-wide">
                      <Star size={14} className="fill-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] animate-pulse" />
                      <span>ADMIN</span>
                    </Link>
                  </>
                )}
                <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                <button onClick={() => setShowLogoutModal(true)} className="text-gray-400 hover:text-red-400 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link href="/auth" className="text-sm font-medium bg-primary/10 text-primary border border-primary/30 px-6 py-2 rounded-full hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:border-primary/50 transition-all backdrop-blur-md">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

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
    </nav>
  );
}
