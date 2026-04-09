"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string; // Container custom classes
  id?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder = "Seleccionar", className = "", id }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref} id={id}>
      <div 
        className="flex items-center justify-between w-full h-full bg-[#111] hover:bg-[#1a1a1a] border border-white/10 hover:border-white/20 px-4 py-3 text-base text-white cursor-pointer transition-all focus-within:ring-2 focus-within:ring-primary/50"
        style={{ borderRadius: "inherit" }}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className={`block truncate ${selectedOption ? "text-white font-medium" : "text-gray-500"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 py-2 bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2.5 cursor-pointer transition-colors flex justify-between items-center mx-2 rounded-lg ${
                value === option.value ? "bg-primary/20 text-primary font-medium" : "text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="truncate">{option.label}</span>
              {value === option.value && <Check size={16} className="text-primary shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
