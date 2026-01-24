# Configuración PWA para Producción

## Problema Común: PWA no se conecta a Supabase

Cuando instalas la PWA en tu móvil, puede que no se conecte correctamente a Supabase. Esto se debe a que:

1. **Variables de entorno**: Las variables de entorno deben estar disponibles en el build de producción
2. **Service Worker**: El service worker puede estar bloqueando las peticiones
3. **CORS**: Supabase debe permitir conexiones desde tu dominio

## Solución Implementada

### 1. Configuración de Workbox

El service worker ahora está configurado para:
- **NO bloquear** peticiones a Supabase
- Usar estrategia `NetworkFirst` para Supabase (siempre intenta red primero)
- Cachear respuestas solo como respaldo

### 2. Configuración de Supabase Client

El cliente de Supabase ahora incluye:
- `persistSession: true` - Mantiene la sesión en PWA
- `autoRefreshToken: true` - Refresca tokens automáticamente
- Headers personalizados para identificar la PWA

### 3. Preconnect en HTML

Se agregó preconnect a Supabase para mejorar la velocidad de conexión:
```html
<link rel="preconnect" href="https://udddlykkjcyekfqlhbim.supabase.co" />
```

## Pasos para Desplegar

### Opción 1: Build Local y Servir

1. **Build de producción**:
   ```bash
   npm run build
   ```

2. **Servir el build** (elige una opción):
   - **Opción A - Vite Preview**:
     ```bash
     npm run preview
     ```
   - **Opción B - Servidor HTTP simple**:
     ```bash
     npx serve dist
     ```
   - **Opción C - Python**:
     ```bash
     cd dist
     python -m http.server 8080
     ```

3. **Acceder desde el móvil**:
   - Asegúrate de que tu PC y móvil estén en la misma red WiFi
   - Encuentra la IP de tu PC:
     - Windows: `ipconfig` (busca IPv4)
     - Mac/Linux: `ifconfig` o `ip addr`
   - En tu móvil, abre: `http://TU_IP:8080` (o el puerto que uses)

4. **Instalar PWA**:
   - En iOS Safari: Compartir → Agregar a pantalla de inicio
   - En Android Chrome: Menú → Agregar a pantalla de inicio

### Opción 2: Desplegar a un Hosting

1. **Build**:
   ```bash
   npm run build
   ```

2. **Subir carpeta `dist`** a:
   - Netlify
   - Vercel
   - GitHub Pages
   - Firebase Hosting
   - Cualquier hosting estático

3. **Variables de entorno**:
   - Asegúrate de que el hosting permita variables de entorno
   - Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el panel del hosting

## Verificar que Funciona

1. **Abre la PWA en tu móvil**
2. **Abre la consola del navegador** (si es posible) o revisa los logs
3. **Verifica que veas**:
   - `✅ Realtime: Todas las suscripciones activas`
   - `📥 Cargados X tareas desde Supabase`
   - Sin errores de conexión

## Troubleshooting

### PWA no se conecta a Supabase

1. **Verifica las variables de entorno**:
   - Asegúrate de que `.env` tiene las URLs correctas
   - En producción, verifica que el hosting tenga las variables configuradas

2. **Verifica CORS en Supabase**:
   - Ve a Supabase Dashboard → Settings → API
   - Asegúrate de que tu dominio esté en la lista de URLs permitidas

3. **Limpia el Service Worker**:
   - En Chrome: DevTools → Application → Service Workers → Unregister
   - Recarga la página

4. **Verifica la conexión de red**:
   - Asegúrate de que el móvil tenga internet
   - Prueba abrir `https://udddlykkjcyekfqlhbim.supabase.co` en el navegador del móvil

### La PWA muestra datos antiguos

1. **Fuerza actualización**:
   - Cierra completamente la PWA
   - Elimínala y vuelve a instalarla

2. **Limpia caché**:
   - En iOS: Configuración → Safari → Limpiar historial y datos
   - En Android: Configuración → Apps → Tu PWA → Almacenamiento → Limpiar caché

## Notas Importantes

- **Localhost NO funciona en PWA instalada**: Una vez instalada, la PWA no puede acceder a `localhost`. Debes usar una IP local o un dominio público.
- **HTTPS requerido para algunas funciones**: Algunas funciones de PWA requieren HTTPS. Para desarrollo local, puedes usar `ngrok` o similar.
- **Service Worker se actualiza automáticamente**: El SW se actualiza cuando hay cambios, pero puede tardar unos segundos.
