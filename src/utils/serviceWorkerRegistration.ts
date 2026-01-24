// Registro optimizado del Service Worker que no bloquea la carga
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Registrar después de que la página cargue completamente
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('✅ SW registrado:', registration.scope);
          
          // Verificar actualizaciones cada hora (no inmediatamente)
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          console.warn('⚠️ SW no disponible:', error);
          // Continuar funcionando sin SW
        });
    });
  }
}

// Función para verificar si estamos offline y usar caché
export async function getCachedData<T>(
  cacheName: string,
  request: Request | string
): Promise<T | null> {
  if (!('caches' in window)) return null;

  try {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Error accediendo al caché:', error);
  }
  return null;
}

// Función para guardar datos en caché
export async function cacheData(
  cacheName: string,
  request: Request | string,
  data: any
): Promise<void> {
  if (!('caches' in window)) return;

  try {
    const cache = await caches.open(cacheName);
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
    await cache.put(request, response);
  } catch (error) {
    console.warn('Error guardando en caché:', error);
  }
}
