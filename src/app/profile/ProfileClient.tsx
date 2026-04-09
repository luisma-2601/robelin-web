"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import StateSelect from "@/components/StateSelect";

export default function ProfileClient({ profile }: { profile: any }) {
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    city: profile?.city || "Caracas"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    const { error } = await supabase
      .from("profiles")
      .update({
        name: formData.name,
        phone: formData.phone,
        city: formData.city
      })
      .eq("id", profile.id);

    if (error) {
      alert("Error actualizando perfil: " + error.message);
    } else {
      setSuccess("¡Perfil actualizado de forma exitosa!");
    }
    setLoading(false);
  };

  return (
    <div className="bg-[#111] border border-white/5 rounded-[30px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      <div className="flex flex-col items-center justify-center mb-8 relative">
         <div className="absolute top-0 w-full h-32 bg-primary/5 blur-[40px] pointer-events-none rounded-full"></div>
         <div className="w-20 h-20 bg-gradient-to-tr from-primary/20 to-primary/5 rounded-full flex items-center justify-center border border-primary/30 mb-4 shadow-[0_0_20px_rgba(250,204,21,0.2)] relative z-10">
            <User size={32} className="text-primary" />
         </div>
         <h2 className="text-xl font-bold text-white text-center tracking-tight">{profile?.name || "Usuario"}</h2>
         <p className="text-gray-400 text-sm flex items-center gap-1 mt-1"><Mail size={13}/> {profile?.email}</p>
      </div>

      {success && (
        <div className="bg-primary/10 text-primary border border-primary/30 p-3 rounded-xl text-xs font-medium mb-6 text-center shadow-[0_0_20px_rgba(250,204,21,0.15)] relative z-10">
          {success}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-4 relative z-10">
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Nombre de Contacto</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex flex-row items-center gap-1.5 block"><Phone size={12}/> Teléfono Móvil</label>
          <input 
            type="tel" 
            value={formData.phone} 
            onChange={(e) => setFormData({...formData, phone: e.target.value})} 
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 block"><MapPin size={12}/> Estado de Envío</label>
          <StateSelect 
            value={formData.city} 
            onChange={(val: string) => setFormData({...formData, city: val})} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 flex justify-center items-center gap-2 bg-primary/10 text-primary border border-primary/30 font-semibold py-3.5 rounded-xl hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(250,204,21,0.3)] transition-all backdrop-blur-md disabled:opacity-50"
        >
          <Save size={18} /> {loading ? "Aplicando..." : "Guardar Modificación"}
        </button>
      </form>
    </div>
  );
}
