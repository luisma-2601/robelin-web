"use client";
import { ChevronUp, ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";

interface CustomNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number | string;
  onChangeValue: (val: number | string) => void;
  step?: number;
  prefixSymbol?: string;
  className?: string;
}

export default function CustomNumberInput({
  value,
  onChangeValue,
  step = 1,
  min,
  max,
  prefixSymbol,
  className = "",
  ...props
}: CustomNumberInputProps) {
  const [localVal, setLocalVal] = useState<string | number>(value);

  // Sync with external value, but avoid truncating in-progress decimals like "5."
  useEffect(() => {
    if (Number(localVal) !== Number(value) && String(localVal) !== String(value)) {
      setLocalVal(value);
    }
  }, [value]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    
    // Auto-strip leading zero if typing another number (e.g. "04" -> "4", but "0." -> "0.")
    if (/^0[1-9]/.test(raw)) {
      raw = raw.replace(/^0/, '');
    }

    setLocalVal(raw); // Maintain raw string (allows typing '.')
    onChangeValue(raw === "" ? "" : Number(raw));
  };
  const handleUp = () => {
    const val = Number(value) || 0;
    const newVal = val + step;
    if (max === undefined || newVal <= Number(max)) {
      // Use toFixed to avoid floating point precision issues (like 1.1 + 0.1 = 1.2000000000000002)
      // Determine decimal places from step
      const decimals = step.toString().split('.')[1]?.length || 0;
      onChangeValue(Number(newVal.toFixed(decimals)));
    }
  };

  const handleDown = () => {
    const val = Number(value) || 0;
    const newVal = val - step;
    if (min === undefined || newVal >= Number(min)) {
      const decimals = step.toString().split('.')[1]?.length || 0;
      onChangeValue(Number(newVal.toFixed(decimals)));
    }
  };

  return (
    <div className={`relative ${className}`}>
      {prefixSymbol && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 font-bold">
          {prefixSymbol}
        </span>
      )}
      <input
        type="number"
        value={localVal}
        onChange={handleOnChange}
        onFocus={(e) => e.target.select()}
        step={step}
        min={min}
        max={max}
        {...props}
        className={`w-full bg-[#111] border border-white/10 hover:border-white/20 rounded-xl ${
          prefixSymbol ? "pl-8" : "pl-4"
        } pr-10 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-10">
        <button
          type="button"
          onClick={handleUp}
          className="text-gray-500 hover:text-primary transition-colors bg-white/5 rounded-t hover:bg-white/10 flex items-center justify-center p-0.5"
          tabIndex={-1}
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          onClick={handleDown}
          className="text-gray-500 hover:text-primary transition-colors bg-white/5 rounded-b hover:bg-white/10 flex items-center justify-center p-0.5"
          tabIndex={-1}
        >
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
