"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";

const VENEZUELA_STATES = [
  "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", 
  "Cojedes", "Delta Amacuro", "Distrito Capital (Caracas)", "Falcón", "Guárico", 
  "Lara", "Mérida", "Miranda", "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", 
  "Táchira", "Trujillo", "La Guaira (Vargas)", "Yaracuy", "Zulia"
];

export default function StateSelect({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStates = VENEZUELA_STATES.filter(state => 
    state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors shadow-[inset_0_2px_4px_rgba(255,255,255,0.02)]"
      >
        <span className={value ? "text-white" : "text-gray-500"}>
          {value || "Selecciona un estado"}
        </span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : "text-gray-500"}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-[0_15px_40px_rgb(0,0,0,0.8)] overflow-hidden backdrop-blur-3xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-white/5 bg-black/40">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <input
                type="text"
                className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(139,92,246,0.15)] placeholder-gray-600 transition-all"
                placeholder="Buscar estado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {filteredStates.length > 0 ? (
              filteredStates.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => {
                    onChange(state);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                    value === state 
                      ? "bg-primary/20 text-primary font-bold shadow-[0_0_15px_rgba(139,92,246,0.1)] border border-primary/20" 
                      : "text-gray-300 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  {state}
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
