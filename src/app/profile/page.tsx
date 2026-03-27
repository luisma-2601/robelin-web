import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export const revalidate = 0; // Don't cache profile page aggressively 

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_usd, total_ves, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-sans font-medium tracking-tight text-white mb-10 drop-shadow-sm">Centro de Mando</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <ProfileClient profile={profile} />
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-[#111] border border-white/5 rounded-[30px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)] h-full">
            <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Historial de Pedidos</h2>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="flex justify-between items-center bg-black/40 border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors">
                    <div>
                      <p className="text-white font-medium text-lg">Orden #{order.id.split('-')[0]}</p>
                      <p className="text-sm text-gray-500 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-xl">${order.total_usd.toFixed(2)}</p>
                      <span className={`inline-block mt-2 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${order.status === 'approved' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                        {order.status === 'pending' ? 'Bajo Revisión' : 'Aprobado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-black/20 rounded-2xl border border-dashed border-white/10">
                <p className="text-gray-500">No has realizado ninguna compra aún.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
