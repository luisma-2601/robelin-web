"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CustomNumberInput from "@/components/CustomNumberInput";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [bcvRate, setBcvRate] = useState(initialSettings?.bcv_rate || "");
  const [isManual, setIsManual] = useState(initialSettings?.is_manual_override || false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    await supabase.from("settings").update({
      bcv_rate: Number(bcvRate),
      is_manual_override: isManual
    }).eq("id", 1);
    alert("Configuración guardada");
    setLoading(false);
  };

  return (
    <div className="bg-card border border-border p-6 rounded-xl max-w-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Control Manual</h3>
            <p className="text-sm text-gray-400">Desactiva el bot automático del BCV</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isManual} onChange={(e) => setIsManual(e.target.checked)} />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Tasa de Cambio (VES / USD)</label>
          <div className={!isManual ? "opacity-50 pointer-events-none" : ""}>
            <CustomNumberInput 
              value={bcvRate} 
              onChangeValue={(val) => setBcvRate(val)} 
              step={0.01} 
              min={0}
              prefixSymbol="Bs."
              className="w-full"
            />
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full bg-primary/10 text-primary border border-primary/30 font-semibold py-2 rounded-lg hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)] transition-all disabled:opacity-50 backdrop-blur-sm"
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
