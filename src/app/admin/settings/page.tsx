import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: settings } = await supabase.from("settings").select("*").eq("id", 1).single();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Configuración de Tasa</h1>
      <SettingsClient initialSettings={settings} />
    </div>
  );
}
