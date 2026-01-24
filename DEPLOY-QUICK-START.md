# 🚀 Despliegue Rápido en Vercel

## Pasos Rápidos (5 minutos)

### 1. Preparar el código
```bash
git add .
git commit -m "Preparar para Vercel"
git push
```

### 2. Conectar con Vercel

**Opción A: Desde el navegador (Más fácil)**
1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New Project"
3. Conecta tu repositorio de GitHub
4. Framework: **Vite** (se detecta automáticamente)
5. Click en "Deploy"

**Opción B: Desde CLI**
```bash
npm install -g vercel
vercel login
vercel
```

### 3. Configurar Variables de Entorno

**IMPORTANTE:** Después del primer despliegue, ve a:
- Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

Agrega:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

**Obtener credenciales:**
- Supabase Dashboard → Settings → API
- Copia "Project URL" y "anon public" key

### 4. Re-desplegar

Después de agregar las variables:
- Vercel Dashboard → Deployments → Click en "..." → Redeploy

O simplemente haz un nuevo commit:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### 5. Configurar CORS en Supabase

1. Supabase Dashboard → Settings → API
2. En "Additional Allowed Origins", agrega:
   ```
   https://tu-proyecto.vercel.app
   https://*.vercel.app
   ```

### 6. Verificar Realtime

1. Supabase Dashboard → Database → Replication
2. Activa Realtime para:
   - ✅ tasks
   - ✅ events
   - ✅ habits
   - ✅ projects
   - ✅ transactions

## ✅ Verificar que Funciona

1. Abre tu URL de Vercel
2. Crea una tarea/evento
3. Abre en otro dispositivo/navegador
4. Verifica que aparezca automáticamente (sin recargar)

## 🎉 ¡Listo!

Tu PWA está desplegada y funcionando con:
- ✅ Sincronización en tiempo real
- ✅ PWA instalable
- ✅ Service Worker activo
- ✅ Actualizaciones automáticas
