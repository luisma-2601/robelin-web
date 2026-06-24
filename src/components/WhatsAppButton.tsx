"use client";

import { useState } from "react";

const WHATSAPP_NUMBER = "58XXXXXXXXXX"; // Cambiar por el número real

export default function WhatsAppButton() {
  const [hover, setHover] = useState(false);

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
    >
      {hover && (
        <span className="bg-white text-gray-900 text-sm font-medium px-4 py-2 rounded-full shadow-lg animate-fade-in whitespace-nowrap">
          ¡Chatea con nosotros!
        </span>
      )}
      <div className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.5)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.7)] hover:scale-110 transition-all duration-300">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
          <path d="M16.004 3.2C8.92 3.2 3.2 8.92 3.2 16c0 2.26.6 4.46 1.72 6.4L3.2 28.8l6.6-1.72A12.72 12.72 0 0016.004 28.8c7.08 0 12.8-5.72 12.8-12.8S23.08 3.2 16.004 3.2zm0 23.2a10.36 10.36 0 01-5.28-1.44l-.38-.22-3.92 1.02 1.04-3.8-.26-.4A10.34 10.34 0 015.6 16c0-5.74 4.66-10.4 10.4-10.4S26.4 10.26 26.4 16s-4.66 10.4-10.4 10.4zm5.7-7.78c-.32-.16-1.86-.92-2.14-1.02-.28-.1-.5-.16-.7.16-.2.3-.78.98-.96 1.18-.18.2-.36.24-.66.08-.3-.16-1.28-.48-2.44-1.5-.9-.8-1.52-1.8-1.7-2.1-.18-.3-.02-.48.14-.64.14-.14.3-.36.46-.54.16-.18.2-.3.3-.5.1-.2.06-.38-.02-.54-.08-.16-.7-1.7-.96-2.32-.26-.62-.52-.54-.7-.54h-.6c-.2 0-.52.08-.8.38-.28.3-1.04 1.02-1.04 2.48s1.06 2.88 1.22 3.08c.14.2 2.1 3.2 5.08 4.48.72.3 1.28.48 1.72.62.72.22 1.38.2 1.9.12.58-.08 1.86-.76 2.12-1.5.26-.74.26-1.36.18-1.5-.08-.14-.28-.22-.6-.38z"/>
        </svg>
      </div>
    </a>
  );
}
