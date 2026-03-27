"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import StateSelect from "@/components/StateSelect";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Distrito Capital (Caracas)");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login")) setError("Correo electrónico o contraseña incorrectos.");
        else if (error.message.includes("Email not confirmed")) setError("Verifica el enlace que enviamos a tu correo para activar tu cuenta.");
        else setError("Ocurrió un error al intentar iniciar sesión. Intenta de nuevo.");
      } else {
        useCartStore.getState().clearCart();
        window.location.href = "/";
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        let msg = error.message;
        if (msg.includes("Password should be")) msg = "La contraseña es muy débil. Utiliza al menos 6 caracteres seguros.";
        else if (msg.includes("already registered")) msg = "Este correo electrónico ya está registrado. Por favor, inicia sesión.";
        setError(msg);
      } else if (data.user) {
        // Insert profile via server action to bypass client RLS issues during signup
        const { createProfile } = await import("@/app/actions/auth");
        const res = await createProfile(data.user.id, name, phone, city, email);
        
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }

        // Si Supabase requiere confirmación de email, la sesión vendrá nula.
        if (!data.session) {
          setSuccess("¡Registro casi listo! Te hemos enviado un enlace a tu correo. Por favor, verifica tu bandeja y haz clic allí para activar tu cuenta, luego inicia sesión.");
          setIsLogin(true); // Switch to login screen
        } else {
          useCartStore.getState().clearCart();
          window.location.href = "/";
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        </h2>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm mb-6">{error}</div>}
        {success && <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 p-3 rounded-lg text-sm mb-6">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre Completo</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Teléfono</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-black border border-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Estado de Envío</label>
                <StateSelect value={city} onChange={setCity} />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Correo Electrónico</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-border rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary/10 text-primary border border-primary/30 font-bold py-3 rounded-xl mt-6 hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:border-primary/50 transition-all backdrop-blur-md disabled:opacity-50">
            {loading ? "Cargando..." : isLogin ? "Ingresar" : "Registrarse"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-semibold">
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
