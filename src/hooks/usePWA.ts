import { useEffect, useState, useRef } from 'react';

export function usePWA() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateServiceWorkerRef = useRef<((reload?: boolean) => Promise<void>) | null>(null);

  // No usar useRegisterSW - manejar SW manualmente para evitar errores de hooks

  // Registrar SW manualmente después de un delay (no bloquea)
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    
    // Esperar mucho tiempo antes de intentar registrar SW
    const timer = setTimeout(() => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          setOfflineReady(true);
          console.log('✅ SW registrado manualmente');
        })
        .catch(() => {
          // Silenciar - la app funciona sin SW
        });
    }, 15000); // 15 segundos - mucho después de que todo cargue

    return () => clearTimeout(timer);
  }, []);

  // Detectar cambios de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Sin conexión - Modo offline activado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Permisos de notificación concedidos');
        return true;
      } else {
        console.warn('⚠️ Permisos de notificación denegados');
        return false;
      }
    }
    return false;
  };

  // Enviar notificación
  const sendNotification = async (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        badge: '/pwa-192x192.png',
        icon: '/pwa-192x192.png',
        ...options,
      });
    }
  };

  // Actualizar aplicación
  const updateApp = async () => {
    if (updateServiceWorkerRef.current) {
      try {
        await updateServiceWorkerRef.current(true);
        setUpdateAvailable(false);
        setNeedRefresh(false);
      } catch (error) {
        // Si falla, simplemente recargar la página
        window.location.reload();
      }
    } else if (needRefresh) {
      // Fallback: recargar la página si no hay updateServiceWorker
      window.location.reload();
    }
  };

  return {
    updateAvailable,
    offlineReady,
    isOnline,
    needRefresh,
    updateApp,
    requestNotificationPermission,
    sendNotification,
  };
}
