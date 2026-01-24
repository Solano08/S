# Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu PWA en Vercel con todas las funcionalidades funcionando correctamente, incluyendo sincronización en tiempo real con Supabase.

## 📋 Requisitos Previos

1. Cuenta en [Vercel](https://vercel.com) (gratis)
2. Cuenta en [Supabase](https://supabase.com) (gratis)
3. Tu proyecto en un repositorio de GitHub (recomendado) o GitLab/Bitbucket

## 🚀 Pasos para Desplegar

### Paso 1: Preparar el Repositorio

1. **Asegúrate de que tu código esté en Git:**
   ```bash
   git add .
   git commit -m "Preparar para despliegue en Vercel"
   git push
   ```

### Paso 2: Configurar Variables de Entorno en Vercel

**IMPORTANTE:** Las variables de entorno deben configurarse en Vercel para que Supabase funcione correctamente.

1. **Ve a tu proyecto en Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Agrega las siguientes variables:**

   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   ```

   ⚠️ **IMPORTANTE:** 
   - Reemplaza `tu-proyecto.supabase.co` con tu URL real de Supabase
   - Reemplaza `tu-anon-key-aqui` con tu clave anónima real de Supabase
   - Estas variables deben estar configuradas para **Production**, **Preview** y **Development**

4. **Cómo obtener tus credenciales de Supabase:**
   - Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
   - Settings → API
   - Copia:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Paso 3: Conectar con Vercel

#### Opción A: Desde GitHub (Recomendado)

1. **Ve a [vercel.com](https://vercel.com)**
2. **Click en "Add New Project"**
3. **Importa tu repositorio de GitHub**
4. **Configuración del proyecto:**
   - Framework Preset: **Vite**
   - Root Directory: `./` (raíz del proyecto)
   - Build Command: `npm run build` (ya configurado en vercel.json)
   - Output Directory: `dist` (ya configurado en vercel.json)
   - Install Command: `npm install`

5. **Click en "Deploy"**

#### Opción B: Desde CLI

1. **Instala Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Inicia sesión:**
   ```bash
   vercel login
   ```

3. **Despliega:**
   ```bash
   vercel
   ```

4. **Sigue las instrucciones en pantalla**

### Paso 4: Verificar el Despliegue

1. **Espera a que el build termine** (generalmente 1-2 minutos)
2. **Vercel te dará una URL** como: `https://tu-proyecto.vercel.app`
3. **Abre la URL en tu navegador**
4. **Verifica que:**
   - ✅ La aplicación carga correctamente
   - ✅ Puedes ver tus datos (tareas, eventos, etc.)
   - ✅ Puedes crear/editar/eliminar elementos
   - ✅ Los cambios se guardan y sincronizan

### Paso 5: Configurar Dominio Personalizado (Opcional)

1. **En Vercel Dashboard → Settings → Domains**
2. **Agrega tu dominio personalizado**
3. **Sigue las instrucciones de DNS**

## 🔧 Configuración de Supabase para Producción

### 1. Configurar CORS en Supabase

Para que tu aplicación funcione correctamente en producción, necesitas permitir tu dominio de Vercel en Supabase:

1. **Ve a Supabase Dashboard → Settings → API**
2. **En "Additional Allowed Origins"**, agrega:
   ```
   https://tu-proyecto.vercel.app
   https://*.vercel.app
   ```
3. **Si tienes dominio personalizado, agrégalo también:**
   ```
   https://tu-dominio.com
   ```

### 2. Verificar Realtime en Supabase

1. **Ve a Supabase Dashboard → Database → Replication**
2. **Asegúrate de que las tablas estén habilitadas para Realtime:**
   - ✅ `tasks`
   - ✅ `events`
   - ✅ `habits`
   - ✅ `projects`
   - ✅ `transactions`

3. **Si no están habilitadas, haz click en cada tabla y activa "Enable Realtime"**

### 3. Verificar Políticas de Seguridad (RLS)

Asegúrate de que las políticas RLS estén configuradas correctamente:

```sql
-- Ejemplo para tasks (ajusta según tus necesidades)
-- Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Users can read own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Permitir inserción a usuarios autenticados
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Permitir actualización a usuarios autenticados
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

-- Permitir eliminación a usuarios autenticados
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);
```

## ✅ Verificación Post-Despliegue

### Checklist de Funcionalidades

- [ ] **Carga inicial:** La aplicación carga sin errores
- [ ] **Datos:** Se muestran tareas, eventos, hábitos, proyectos
- [ ] **Crear:** Puedes crear nuevos elementos
- [ ] **Editar:** Puedes editar elementos existentes
- [ ] **Eliminar:** Puedes eliminar elementos
- [ ] **Sincronización:** Los cambios se guardan en Supabase
- [ ] **Tiempo real:** Los cambios se reflejan en otros dispositivos
- [ ] **PWA:** Puedes instalar la aplicación en móvil
- [ ] **Offline:** La aplicación funciona offline (con datos cacheados)

### Probar Sincronización en Tiempo Real

1. **Abre la aplicación en dos dispositivos/navegadores diferentes**
2. **Crea una tarea en el dispositivo 1**
3. **Verifica que aparezca automáticamente en el dispositivo 2** (sin recargar)
4. **Edita la tarea en el dispositivo 2**
5. **Verifica que los cambios se reflejen en el dispositivo 1**

## 🐛 Troubleshooting

### Problema: La aplicación no se conecta a Supabase

**Solución:**
1. Verifica que las variables de entorno estén configuradas en Vercel
2. Verifica que las URLs de Supabase estén en CORS
3. Revisa la consola del navegador para ver errores específicos

### Problema: Los cambios no se sincronizan

**Solución:**
1. Verifica que Realtime esté habilitado en Supabase
2. Verifica que las políticas RLS permitan las operaciones
3. Revisa la consola para errores de conexión

### Problema: Service Worker no funciona

**Solución:**
1. Verifica que el archivo `vercel.json` esté en la raíz del proyecto
2. Verifica que los headers del service worker estén configurados
3. Limpia el caché del navegador y reinstala la PWA

### Problema: Rutas no funcionan (404)

**Solución:**
1. Verifica que `vercel.json` tenga la configuración de `rewrites`
2. Todas las rutas deben redirigir a `/index.html`

## 📱 Instalar PWA en Móvil

Una vez desplegado:

1. **Abre la URL de Vercel en tu móvil**
2. **iOS Safari:**
   - Compartir → Agregar a pantalla de inicio
3. **Android Chrome:**
   - Menú → Agregar a pantalla de inicio

## 🔄 Actualizaciones Automáticas

Vercel despliega automáticamente cuando:
- Haces push a la rama `main` (producción)
- Haces push a otras ramas (preview)

El service worker se actualiza automáticamente gracias a `autoUpdate` configurado en `vite.config.ts`.

## 📊 Monitoreo

- **Vercel Dashboard:** Ve el estado de tus despliegues
- **Supabase Dashboard:** Monitorea las conexiones y queries
- **Browser Console:** Revisa errores en tiempo real

## 🎉 ¡Listo!

Tu aplicación ahora está desplegada y funcionando en producción con:
- ✅ Sincronización en tiempo real
- ✅ PWA completamente funcional
- ✅ Service Worker optimizado
- ✅ Actualizaciones automáticas
