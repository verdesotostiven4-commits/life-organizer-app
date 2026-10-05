# Harmony OS

Harmony OS es una PWA privada para organizar un hogar compartido: tareas, horario, asistencia, estudios, despensa, compras rápidas, finanzas, recordatorios, calendario, plantillas y bienestar.

## Estado

La aplicación usa Next.js 16, React 19 y Supabase. El modelo principal está preparado para dos miembros dentro de un mismo hogar mediante `household_id`, conservando `user_id` para trazabilidad y para los datos personales de bienestar.

Incluye hogar compartido con invitaciones, lista “Donde el vecino” en tiempo real, recordatorios, centro de notificaciones, finanzas compartidas editables, tareas, horario, asistencia, académico, despensa, calendario, plantillas, bienestar personal y PWA instalable.

## Desarrollo local

Requisitos: Node.js 22 o superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000`.

Variables requeridas:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Validación

```bash
npm run lint
npm run build
```

GitHub Actions ejecuta ambas comprobaciones para pull requests dirigidos a `main`.

## Supabase

El proyecto de Supabase es la fuente de verdad de la base de datos de producción. El repositorio conserva el esquema base y migraciones de mantenimiento bajo `supabase/`.

Las tablas antiguas del prototipo se mantienen como archivo histórico y tienen RLS con políticas de denegación explícita para los roles públicos de la aplicación.

## Despliegue

La ruta recomendada es Vercel: importa `verdesotostiven4-commits/life-organizer-app`, configura las dos variables públicas de Supabase y despliega desde `main`. Después verifica login, unión al hogar, finanzas y lista compartida desde dos cuentas diferentes.

Las notificaciones dentro de Harmony y las notificaciones del navegador mientras la PWA está activa ya forman parte de la aplicación. El Web Push con la aplicación completamente cerrada requiere infraestructura de push y credenciales privadas separadas del repositorio.

## Seguridad

Todas las tablas públicas tienen RLS habilitado. Después de cambios de esquema, revisa los asesores de seguridad y rendimiento de Supabase. Si el plan lo permite, activa la protección contra contraseñas filtradas en Auth.
