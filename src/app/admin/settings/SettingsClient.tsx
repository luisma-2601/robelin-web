"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CustomNumberInput from "@/components/CustomNumberInput";
import { Bot, BotOff, CheckCircle2, Pencil } from "lucide-react";

export default function SettingsClient({ initialSettings }: { initialSettings: { bcv_rate: number, is_manual_override: boolean } | null }) {
  const [bcvRate, setBcvRate] = useState(initialSettings?.bcv_rate || "");
  const [isManual, setIsManual] = useState(initialSettings?.is_manual_override || false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    await supabase.from("settings").update({
      bcv_rate: Number(bcvRate),
      is_manual_override: isManual
    }).eq("id", 1);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const botActive = !isManual;

  return (
    <div className="max-w-2xl mx-auto w-full px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">Configuración</h1>
      <p className="text-gray-500 text-sm text-center mb-8">Panel de control de la tasa BCV y ajustes del sistema</p>

      {/* BOT STATUS CARD */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 mb-6 transition-all duration-500 ${
        botActive
          ? "bg-green-500/5 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.08)]"
          : "bg-yellow-500/5 border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.08)]"
      }`}>
        {/* Glow blob */}
        <div className={`absolute -top-8 -right-8 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30 ${botActive ? "bg-green-500" : "bg-yellow-400"}`} />

        <div className="flex items-center gap-5 relative z-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${botActive ? "bg-green-500/10 border border-green-500/20" : "bg-yellow-500/10 border border-yellow-500/20"}`}>
            {botActive
              ? <Bot size={32} className="text-green-400" />
              : <BotOff size={32} className="text-yellow-400" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${botActive ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${botActive ? "text-green-400" : "text-yellow-400"}`}>
                {botActive ? "Bot Automático ACTIVO" : "Control Manual ACTIVO"}
              </span>
            </div>
            <p className="text-white font-semibold text-lg leading-tight">
              {botActive
                ? "La tasa BCV se actualiza automáticamente"
                : "La tasa BCV se actualiza de forma manual"
              }
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {botActive
                ? "El bot consulta el BCV periódicamente y ajusta la tasa sin intervención."
                : "Has desactivado el bot. Debes ingresar la tasa manualmente."
              }
            </p>
          </div>
        </div>
      </div>

      {/* SETTINGS FORM CARD */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">

        {/* Toggle row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Pencil size={16} className="text-primary" />
              Control Manual
            </h3>
            <p className="text-sm text-gray-400 mt-0.5">Desactiva el bot automático del BCV</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isManual}
              onChange={(e) => setIsManual(e.target.checked)}
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary transition-all"></div>
          </label>
        </div>

        {/* BCV rate input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Tasa de Cambio Actual <span className="text-gray-500 font-normal">(Bs. por USD)</span>
          </label>
          <div className={`transition-all duration-300 ${!isManual ? "opacity-40 pointer-events-none" : ""}`}>
            <CustomNumberInput
              value={bcvRate}
              onChangeValue={(val) => setBcvRate(val)}
              step={0.01}
              min={0}
              prefixSymbol="Bs."
              className="w-full"
            />
            {!isManual && (
              <p className="text-xs text-gray-500 mt-2">Activa el control manual para editar este valor.</p>
            )}
          </div>
          {isManual && (
            <p className="text-xs text-yellow-400/70 mt-2">⚠️ Al guardar, el bot quedará en pausa y esta tasa será la oficial en la tienda.</p>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full font-bold tracking-wide py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            saved
              ? "bg-green-500/10 text-green-400 border border-green-500/30"
              : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)] disabled:opacity-50 backdrop-blur-sm"
          }`}
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            : saved
            ? <><CheckCircle2 size={18} /> Guardado con éxito</>
            : "Guardar Cambios"
          }
        </button>
      </div>
    </div>
  );
}
