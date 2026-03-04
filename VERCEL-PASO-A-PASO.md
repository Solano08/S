# Conectar y desplegar la app en Vercel — Paso a paso

Esta guía te lleva **desde cero** hasta tener la aplicación **S | Personal Hub** desplegada en Vercel y funcionando con Supabase.

---

## Requisitos previos

- Cuenta en [Vercel](https://vercel.com) (gratis).
- Cuenta en [Supabase](https://supabase.com) (gratis).
- Proyecto en un repositorio de **GitHub** (recomendado), GitLab o Bitbucket.
- En tu máquina: Git y Node.js instalados.

---

## Paso 1: Dejar el código listo y subirlo a GitHub

1. En la raíz del proyecto (`Sproject`), abre terminal y verifica que todo esté commiteado:
   ```bash
   git status
   ```

2. Si hay cambios sin commit:
   ```bash
   git add .
   git commit -m "Preparar despliegue en Vercel"
   ```

3. Si aún no tienes repositorio en GitHub:
   - Ve a [github.com](https://github.com) → **New repository**.
   - Crea un repo (ej. `Sproject` o `personal-hub`), **sin** inicializar con README si ya tienes código local.

4. Conecta tu carpeta local al repo y sube el código (sustituye `TU_USUARIO` y `TU_REPO` por los tuyos):
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git branch -M main
   git push -u origin main
   ```

Si ya tenías el repo conectado, solo haz:
```bash
git push
```

---

## Paso 2: Crear cuenta / iniciar sesión en Vercel

1. Entra en **[vercel.com](https://vercel.com)**.
2. Pulsa **Sign Up** o **Log In**.
3. Elige **Continue with GitHub** (recomendado para conectar el repo en el siguiente paso).

---

## Paso 3: Importar el proyecto desde GitHub

1. En el dashboard de Vercel, pulsa **Add New…** → **Project**.
2. En la lista de repositorios, busca **tu repositorio** (el que usaste en el Paso 1) y pulsa **Import**.
3. En la pantalla de configuración:
   - **Framework Preset:** Vite (Vercel suele detectarlo solo).
   - **Root Directory:** `./` (raíz del proyecto).
   - **Build Command:** `npm run build` (ya viene en `vercel.json`).
   - **Output Directory:** `dist` (ya viene en `vercel.json`).
   - **Install Command:** `npm install`.

4. **No hagas Deploy todavía.** Primero añade las variables de entorno (Paso 4).

---

## Paso 4: Configurar variables de entorno (Supabase)

Sin estas variables, la app en Vercel no podrá hablar con Supabase.

1. En la misma pantalla del proyecto (antes de desplegar), abre la sección **Environment Variables**.
2. Añade **dos variables**:

   | Name                   | Value                          | Entornos        |
   |------------------------|---------------------------------|-----------------|
   | `VITE_SUPABASE_URL`    | `https://xxxxx.supabase.co`    | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` (tu anon key)       | Production, Preview, Development |

3. Cómo obtener los valores:
   - Entra en [app.supabase.com](https://app.supabase.com) → tu proyecto.
   - **Settings** → **API**.
   - **Project URL** → ese valor es `VITE_SUPABASE_URL`.
   - **anon public** (Project API keys) → ese valor es `VITE_SUPABASE_ANON_KEY`.

4. Pulsa **Deploy** para el primer despliegue.

---

## Paso 5: Esperar el build y comprobar la URL

1. Vercel ejecutará `npm install` y `npm run build`.
2. Cuando termine, verás una URL como:  
   `https://sproject-xxxxx.vercel.app` (o el nombre de tu proyecto).
3. Abre esa URL en el navegador y comprueba que la app carga (aunque aún puedas tener que configurar CORS en Supabase).

---

## Paso 6: Permitir el dominio de Vercel en Supabase (CORS)

Para que el frontend en Vercel pueda usar la API de Supabase:

1. Supabase Dashboard → tu proyecto → **Settings** → **API**.
2. En **Additional Allowed Origins** (o configuración de CORS que use tu proyecto), añade:
   - `https://tu-proyecto.vercel.app`
   - `https://*.vercel.app`
3. Guarda los cambios.

Sustituye `tu-proyecto` por el nombre real que te haya dado Vercel (o usa la URL exacta que te muestre el dashboard).

---

## Paso 7: Verificar que todo funciona

1. Abre de nuevo la URL de Vercel.
2. Comprueba que:
   - La app carga sin errores en consola (F12).
   - Puedes ver y crear/editar tareas, eventos, etc.
   - Los datos se guardan (es decir, que Supabase responde bien).

Si algo falla, revisa la consola del navegador y que las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén bien en Vercel (Paso 4) y que los orígenes de Vercel estén en Supabase (Paso 6).

---

## Resumen de qué tienes ya en el proyecto

- **`vercel.json`** en la raíz:
  - `buildCommand`: `npm run build`
  - `outputDirectory`: `dist`
  - `rewrites`: todas las rutas → `/index.html` (SPA).
  - Headers para el Service Worker (`/sw.js`, `/registerSW.js`) y seguridad (X-Content-Type-Options, etc.).

Con eso, Vercel ya sabe cómo construir y servir la app. Solo hace falta conectar el repo, poner las variables de entorno y configurar CORS en Supabase como en los pasos anteriores.

---

## Despliegues posteriores

- Cada **push** a la rama que hayas conectado (por defecto `main`) generará un nuevo despliegue en Vercel.
- Para **re-desplegar** sin cambiar código: en Vercel → **Deployments** → los tres puntos del último deployment → **Redeploy**.

---

## Opción alternativa: desplegar con la CLI de Vercel

Si prefieres no usar GitHub de entrada:

1. Instala la CLI:
   ```bash
   npm install -g vercel
   ```

2. En la raíz del proyecto:
   ```bash
   cd "c:\Solano\1. Perso\Projects\Sproject"
   vercel login
   vercel
   ```

3. Responde las preguntas (link a proyecto existente o crear uno nuevo).
4. Después del primer despliegue, añade las variables de entorno en **Vercel Dashboard → Tu proyecto → Settings → Environment Variables** y vuelve a desplegar (o haz un nuevo `vercel --prod`).

---

## Checklist rápido

- [ ] Código en GitHub (o en el repo que uses).
- [ ] Proyecto importado en Vercel desde ese repo.
- [ ] Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Vercel.
- [ ] Primer deploy completado con éxito.
- [ ] Orígenes de Vercel añadidos en Supabase (CORS).
- [ ] App abierta en la URL de Vercel y datos cargando correctamente.

Cuando todo esto esté hecho, la aplicación quedará conectada a Vercel y funcionando con Supabase en producción.
