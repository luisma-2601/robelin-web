# Robelin II — E-commerce para distribuidora de productos de belleza

Tienda en línea con panel de administración para **Robelin II**, distribuidora de productos profesionales para salones de belleza y barberías en Caracas, Venezuela. Los clientes navegan el catálogo con precios en **USD y bolívares (tasa BCV actualizada automáticamente)**, arman su carrito y envían el pedido por WhatsApp; el negocio gestiona productos, inventario, pedidos y contenido desde un panel propio.

🔗 **Demo en vivo:** https://robelin-web.vercel.app/

> Proyecto desarrollado para un cliente real.

<!-- Capturas: docs/preview-*.png -->

## Funcionalidades

### Tienda pública
- Catálogo con búsqueda y filtro por categoría (Cuidado Capilar, Barbería, Manicura, Peluquería).
- Precios en USD y Bs. calculados con la **tasa oficial BCV**.
- Carrito persistente (Zustand + `localStorage`) y checkout que **registra la orden en la base de datos** y abre WhatsApp con el resumen y código del pedido.
- Registro e inicio de sesión (Supabase Auth) con perfil de cliente (cédula, teléfono, ciudad).
- Secciones de ofertas, sobre nosotros, horario y ubicación, editables desde el panel.
- **Asistente virtual con IA** conectado a un flujo de n8n.

### Panel de administración (`/admin`)
- Dashboard con métricas de ventas y seguimiento de clientes.
- Gestión de pedidos: aprobar (descuenta stock y suma ventas) o rechazar.
- CRUD de productos, **importación y actualización masiva por CSV** y gestor de imágenes.
- Gestión de ofertas e información de la tienda.
- Configuración de la tasa BCV: automática o **override manual**.

### Tasa BCV automática
- Cron diario (Vercel Cron → `/api/cron/bcv`) que consulta [DolarApi](https://ve.dolarapi.com) y actualiza la tasa, respetando el override manual.
- API pública `GET /api/bcv-rate` con CORS y rate limiting.

## Seguridad

- Rutas `/admin` protegidas en el middleware (sesión + rol `admin` en `profiles`).
- Server Actions de administración validan el rol antes de usar la *service role key*.
- **Totales calculados en el servidor**: precios y tasa BCV se leen de la base de datos, nunca del cliente.
- Validación de entradas con Zod, límite de pedidos por usuario y rate limiting en login y API pública.
- Row Level Security (RLS) en las tablas de Supabase.

## Stack

| Área | Tecnologías |
|---|---|
| Framework | Next.js 14 (App Router, Server Actions) · React 18 · TypeScript |
| Estilos | Tailwind CSS · Lucide |
| Estado y formularios | Zustand · React Hook Form · Zod |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Integraciones | DolarApi (tasa BCV) · n8n (asistente IA) · WhatsApp |
| Despliegue | Vercel + Vercel Cron |

## Estructura

```
src/
├── app/
│   ├── actions/        # Server Actions: auth, pedidos, productos, ofertas, info de tienda
│   ├── admin/          # Panel: dashboard, pedidos, productos, imágenes, ofertas, ajustes
│   ├── api/
│   │   ├── bcv-rate/   # API pública de la tasa BCV
│   │   └── cron/bcv/   # Actualización programada de la tasa
│   ├── auth/ cart/ profile/
│   └── page.tsx        # Tienda pública
├── components/         # Catálogo, tarjetas, navbar, chat, secciones públicas
├── lib/                # Clientes de Supabase, tasa BCV, rate limit, tipos
├── store/              # Carrito (Zustand)
└── middleware.ts       # Protección de /admin y rate limiting
supabase/migrations/    # Scripts SQL (tablas, RLS y políticas)
docs/                   # CSV de ejemplo para la importación masiva
```

## Cómo correrlo localmente

Requisitos: Node.js 20+ y un proyecto de [Supabase](https://supabase.com).

```bash
git clone https://github.com/luisma-2601/robelin-web.git
cd robelin-web
npm install
cp .env.example .env.local   # completar las variables
npm run dev                  # http://localhost:3000
```

Ejecutar los scripts de `supabase/migrations/` en el SQL Editor de Supabase. Para acceder al panel, asignar `role = 'admin'` al usuario en la tabla `profiles`.

### Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexión pública a Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor) |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp de la tienda, formato internacional sin `+` |
| `NEXT_PUBLIC_CHAT_WEBHOOK_URL` | Webhook de n8n del asistente (opcional; sin él no se muestra el chat) |
| `CRON_SECRET` | Secreto que Vercel envía al cron de la tasa BCV |

## Autor

**Luis Manuel Angulo Ramírez** — Estudiante de Ingeniería en Sistemas (Universidad Metropolitana, Caracas). Desarrollo full-stack, automatización e IA.

- LinkedIn: [luis-angulo-ramirez](https://www.linkedin.com/in/luis-angulo-ramirez)
- GitHub: [@luisma-2601](https://github.com/luisma-2601)
