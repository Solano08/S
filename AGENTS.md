# Agentes del proyecto — S | Personal Hub

Este documento describe los **agentes por rol** del proyecto, dónde se definen y cómo mantener el contexto actualizado. Cada agente es experto en su área y debe usar siempre la mejor información, opción, diseño y arquitectura disponibles.

---

## Configuración MCP

- **cursor-ide-browser**: activo. Se usa para testing en navegador y verificación de UI/responsive.
- **cursor-browser-extension**: **desactivado** en `.cursor/mcp.json` para evitar duplicidad.
- Si sigue activo, desactívalo manualmente en **Cursor → Settings → MCP**.

---

## Agentes y reglas

| Agente | Rol | Regla | Cuándo aplica |
|--------|-----|-------|----------------|
| **Frontend** | UI, responsive (PC + móvil), diseño iOS Liquid Glass | `.cursor/rules/frontend.mdc` | Al trabajar en `**/*.tsx`, `**/*.css`, `components/`, `layout/`, `pages/` |
| **Backend** | Supabase, datos, Realtime, AppDataContext | `.cursor/rules/backend.mdc` | Al trabajar en `lib/supabase*`, `context/AppDataContext*`, `utils/localStorageCache*`, `supabase/` |
| **PWA** | vite-plugin-pwa, Workbox, manifest, offline | `.cursor/rules/pwa.mdc` | Al trabajar en `vite.config*`, `manifest*`, `sw*`, iconos, `usePWA`, `PWAInstaller` |
| **Testing** | cursor-ide-browser, E2E, verificación responsive y flujos | `.cursor/rules/testing.mdc` | Al trabajar en tests o al **probar la app en navegador** |
| **Terminal** | Comandos, scripts npm, ejecución con contexto de todos los agentes | `.cursor/rules/terminal.mdc` | **Siempre** (`alwaysApply`). Ejecuta los comandos necesarios. |

Además, **project-context** (`.cursor/rules/project-context.mdc`) aplica siempre y mantiene el contexto global del proyecto.

---

## Stack y arquitectura (resumen)

- **Frontend**: React 19, TypeScript, Vite 7, React Router 7. Layout: `MainLayout` + `BottomNav`. Diseño: iOS Liquid Glass, Framer Motion, variables CSS en `index.css`.
- **Backend**: Supabase (Postgres, Realtime, RLS). Tablas: `app_overview`, `tasks`, `transactions`, `events`, `habits`, `projects`, `goals`. Estado: `AppDataContext` + `localStorageCache`.
- **PWA**: vite-plugin-pwa, Workbox, manifest, runtime caching para Supabase. Deploy: Vercel.
- **Rutas**: `/` (Home), `/projects`, `/finances`, `/calendar`, `/ideas`, `/assistant`.

---

## Cómo mantener el contexto actualizado

1. **Al cambiar la estructura de la app** (rutas, layout, páginas): actualizar `AGENTS.md` y `frontend.mdc` si afecta UI o navegación.
2. **Al cambiar datos o Supabase** (tablas, tipos, context): actualizar `backend.mdc` y, si hace falta, `AGENTS.md` y `schema`/`add-*.sql`.
3. **Al cambiar PWA** (manifest, Workbox, SW): actualizar `pwa.mdc` y `AGENTS.md` si cambia el flujo de instalación o offline.
4. **Al cambiar flujos de testing** o uso del navegador: actualizar `testing.mdc`.
5. **Al añadir o modificar scripts** en `package.json`: actualizar `terminal.mdc` (tabla de comandos y cuándo ejecutarlos).

Cada regla incluye una sección **«Contexto en tiempo real»** con archivos concretos que revisar para esa área. Úsalos siempre que vayas a hacer cambios relevantes.
