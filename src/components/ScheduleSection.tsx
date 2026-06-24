"use client";

import { Clock, MapPin, Phone } from "lucide-react";

const SCHEDULE = [
  { day: "Lunes", hours: "8:00 AM - 6:00 PM", open: true },
  { day: "Martes", hours: "8:00 AM - 6:00 PM", open: true },
  { day: "Miércoles", hours: "8:00 AM - 6:00 PM", open: true },
  { day: "Jueves", hours: "8:00 AM - 6:00 PM", open: true },
  { day: "Viernes", hours: "8:00 AM - 6:00 PM", open: true },
  { day: "Sábado", hours: "8:00 AM - 4:00 PM", open: true },
  { day: "Domingo", hours: "Cerrado", open: false },
];

const ADDRESS = "Av. Principal, Centro Comercial XYZ, Local 12, Caracas, Venezuela";
const PHONE = "+58 XXX-XXXXXXX";

function getCurrentDay(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export default function ScheduleSection() {
  const today = getCurrentDay();

  return (
    <section id="horarios" className="scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horarios */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Clock size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Horarios</h2>
              <p className="text-sm text-gray-500">Nuestro horario de atención</p>
            </div>
          </div>

          <div className="space-y-1">
            {SCHEDULE.map((item, i) => (
              <div
                key={item.day}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                  i === today
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  {i === today && (
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                  <span className={`text-sm font-medium ${i === today ? "text-primary" : "text-white"}`}>
                    {item.day}
                  </span>
                  {i === today && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Hoy</span>
                  )}
                </div>
                <span className={`text-sm ${item.open ? "text-gray-400" : "text-red-400/80"}`}>
                  {item.hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <MapPin size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ubicación</h2>
              <p className="text-sm text-gray-500">Encuéntranos aquí</p>
            </div>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-white/5 mb-6 min-h-[200px] bg-white/5 flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125516.14798498088!2d-66.96044085!3d10.480593799999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a58adcd824807%3A0x93dd2eae0a998483!2sCaracas%2C%20Distrito%20Capital%2C%20Venezuela!5e0!3m2!1ses!2s!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 200 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-400">{ADDRESS}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-gray-500 shrink-0" />
              <p className="text-sm text-gray-400">{PHONE}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
