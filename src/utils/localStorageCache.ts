// Utilidades para cachear datos en localStorage para funcionamiento offline

const CACHE_PREFIX = 'app_cache_';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hora

export function saveToCache<T>(key: string, data: T): void {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error guardando en caché:', error);
  }
}

export function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    
    // Verificar si el caché expiró
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return data as T;
  } catch (error) {
    console.warn('Error leyendo del caché:', error);
    return null;
  }
}

export function clearCache(key?: string): void {
  try {
    if (key) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } else {
      // Limpiar todo el caché
      Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    }
  } catch (error) {
    console.warn('Error limpiando caché:', error);
  }
}
