# Guía de Verificación: Sincronización Realtime (Localhost ↔ Vercel)

Para asegurar que tu aplicación funcione perfectamente sincronizada entre tu entorno local y la versión desplegada en Vercel, sigue estos pasos críticos.

## 1. Configuración en Supabase (Base de Datos)

Para que los cambios se reflejen en tiempo real, debes activar la "Replicación" en Supabase.

1.  Ve a tu **Supabase Dashboard**.
2.  Navega a **Database** (icono de base de datos en la barra lateral) -> **Replication**.
3.  Verás una tabla llamada `Source`. Asegúrate de que el toggle **Insert/Update/Delete** esté **ACTIVADO** para las siguientes tablas:
    *   `tasks`
    *   `events`
    *   `transactions`
    *   `habits`
    *   `projects`
    *   `app_overview`
4.  Si no ves las tablas, haz clic en "0 tables" bajo la columna "Source" y selecciónalas todas.

## 2. Configuración en Vercel (Variables de Entorno)

Vercel necesita saber a qué base de datos conectarse.

1.  Ve a tu proyecto en **Vercel**.
2.  Ve a **Settings** -> **Environment Variables**.
3.  Asegúrate de tener agregadas las siguientes variables (con los mismos valores que en tu archivo `.env` local):
    *   `VITE_SUPABASE_URL`: (Tu URL de Supabase, ej: `https://xyz.supabase.co`)
    *   `VITE_SUPABASE_ANON_KEY`: (Tu clave pública `anon`, empieza con `eyJ...`)
4.  Si las agregaste o cambiaste recién, ve a **Deployments** y haz clic en **Redeploy** en tu último despliegue para que los cambios surtan efecto.

## 3. Verificación de Sincronización

Una vez configurado lo anterior:

1.  Abre la aplicación en **Localhost** (`npm run dev`).
2.  Abre la aplicación en **Vercel** (tu dominio `.vercel.app`).
3.  Pon las ventanas una al lado de la otra.
4.  Crea una nueva tarea o evento en Localhost.
5.  **Deberías verla aparecer INSTANTÁNEAMENTE en la ventana de Vercel** (y viceversa).

## Solución de Problemas Comunes

*   **"No veo los cambios de código en Vercel":**
    *   Asegúrate de haber hecho `git push`.
    *   Revisa que el "Build" en Vercel esté en verde (Success).
    *   Si es una PWA, a veces necesitas cerrar y abrir la app o recargar la página 2 veces para recibir la nueva versión.

*   **"No se sincronizan los datos":**
    *   Revisa la consola del navegador (F12). Si ves errores en rojo relacionados con WebSocket o Supabase, verifica las variables de entorno en Vercel.
    *   Si dice "Channel error", verifica el paso 1 (Replication en Supabase).
