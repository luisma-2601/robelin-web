"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

const WEBHOOK_URL = "https://server1.luis-automations.click/webhook/chat";
const SESSION_KEY = "robelin_chat_sid";

function formatBotMessage(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^\*\s+/gm, "• ")
    .replace(/\n/g, "<br/>")
    .replace(/\*/g, "");
}

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

const WELCOME: Message = {
  id: "welcome",
  role: "bot",
  text: "¡Hola! Soy el asistente de Robelin II. ¿En qué puedo ayudarte hoy?",
};

export default function ChatWidget() {
  // ── All hooks first, before any conditional return ──
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open]);

  // ── Guard: hide on admin pages (after all hooks) ──
  if (pathname?.startsWith("/admin")) return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || typing) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: getSessionId() }),
      });

      if (!res.ok) throw new Error("HTTP " + res.status);

      const data = await res.json();
      const reply =
        typeof data.output === "string" && data.output
          ? data.output
          : "Lo siento, no pude procesar tu mensaje.";

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "bot",
          text: "Lo siento, algo salió mal. Por favor intenta de nuevo.",
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat Panel ── */}
      <div
        className={`fixed bottom-[5.5rem] left-2 right-2 min-[420px]:left-4 min-[420px]:right-auto min-[420px]:w-[380px] h-[min(500px,calc(100dvh-6rem))] z-50 flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-[0_8px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 ease-out origin-bottom-left ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-3 scale-[0.97] pointer-events-none"
        }`}
      >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <MessageSquare size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">Robelin Bot</p>
                <p className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  En línea
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                    msg.role === "user"
                      ? "bg-primary text-black font-medium rounded-2xl rounded-br-sm whitespace-pre-wrap animate-chat-user"
                      : "bg-[#1a1a1a] text-gray-200 border border-white/5 rounded-2xl rounded-bl-sm animate-chat-bot"
                  }`}
                  {...(msg.role === "bot"
                    ? { dangerouslySetInnerHTML: { __html: formatBotMessage(msg.text) } }
                    : { children: msg.text })}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-[#1a1a1a] border border-white/5 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input + Footer */}
          <div className="px-3 py-3 border-t border-white/10 bg-[#111] shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                disabled={typing}
                className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/40 transition-colors disabled:opacity-50 min-w-0"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || typing}
                className="w-10 h-10 rounded-xl bg-primary hover:bg-yellow-400 active:scale-90 text-black flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-[0_0_15px_rgba(250,204,21,0.2)] hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                aria-label="Enviar"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-2 select-none">
              Powered by Robelin Bot
            </p>
          </div>
      </div>

      {/* ── Floating Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
        className="fixed bottom-6 left-4 z-50 w-14 h-14 rounded-full bg-[#111] border border-white/10 hover:border-primary/50 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_25px_rgba(250,204,21,0.25)] transition-all duration-300 hover:scale-110"
      >
        {open ? (
          <X size={22} className="text-gray-300" />
        ) : (
          <MessageSquare size={22} className="text-primary" />
        )}
      </button>
    </>
  );
}
