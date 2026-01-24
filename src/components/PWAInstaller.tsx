import { useEffect, useState } from 'react';
import { usePWA } from '../hooks/usePWA';

// Componente simplificado que no bloquea la renderización

export function PWAInstaller() {
  // Usar usePWA normalmente - los hooks deben ser llamados incondicionalmente
  const { updateAvailable, offlineReady, isOnline, updateApp } = usePWA();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Detectar evento beforeinstallprompt (para Android/Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  // Para iOS, mostrar instrucciones
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  if (isStandalone) {
    return null; // Ya está instalada
  }

  return (
    <>
      {/* Banner de actualización disponible */}
      {updateAvailable && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            background: 'var(--glass-bg-base)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '0.5px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Actualización disponible
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Hay una nueva versión disponible
            </div>
          </div>
          <button
            onClick={updateApp}
            style={{
              background: 'var(--ios-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Actualizar
          </button>
        </div>
      )}

      {/* Banner de instalación para iOS */}
      {isIOS && !isStandalone && showInstallPrompt && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            background: 'var(--glass-bg-base)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '0.5px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Instalar en iPhone
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Toca el botón <span style={{ fontWeight: 700 }}>Compartir</span> y luego{' '}
            <span style={{ fontWeight: 700 }}>Agregar a pantalla de inicio</span>
          </div>
        </div>
      )}

      {/* Banner de instalación para Android/Chrome */}
      {!isIOS && showInstallPrompt && deferredPrompt && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            background: 'var(--glass-bg-base)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '0.5px solid var(--glass-border)',
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Instalar aplicación
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Instala para acceso rápido
            </div>
          </div>
          <button
            onClick={handleInstall}
            style={{
              background: 'var(--ios-blue)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Instalar
          </button>
        </div>
      )}

      {/* Indicador de estado offline */}
      {!isOnline && (
        <div
          style={{
            position: 'fixed',
            top: 'env(safe-area-inset-top)',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            background: 'rgba(255, 69, 58, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '12px',
            padding: '8px 12px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          Sin conexión - Modo offline activo
        </div>
      )}

      {/* Indicador de lista para offline */}
      {offlineReady && isOnline && (
        <div
          style={{
            position: 'fixed',
            top: 'env(safe-area-inset-top)',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            background: 'rgba(48, 219, 91, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '12px',
            padding: '8px 12px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#fff',
            textAlign: 'center',
            animation: 'fadeOut 3s ease-out forwards',
          }}
        >
          ✅ Aplicación lista para funcionar offline
        </div>
      )}
    </>
  );
}
