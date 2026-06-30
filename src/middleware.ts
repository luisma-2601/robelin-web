import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Rate limiting en rutas de autenticación (10 intentos / 10 minutos por IP)
  if (pathname === "/auth" && request.method === "POST") {
    if (!rateLimit(`auth:${ip}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera unos minutos." },
        { status: 429 }
      );
    }
  }

  // Rate limiting en API pública BCV (60 req / minuto por IP)
  if (pathname.startsWith("/api/bcv-rate")) {
    if (!rateLimit(`bcv:${ip}`, 60, 60 * 1000)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // Protección de rutas /admin
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Si la consulta falla o el rol no es admin, denegar acceso
  if (profileError || profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/auth", "/api/bcv-rate"],
};
