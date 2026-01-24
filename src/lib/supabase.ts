import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validar que las variables de entorno estén configuradas
if (supabaseUrl && supabaseAnonKey) {
    // Validar formato básico de la URL
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
        console.error('❌ VITE_SUPABASE_URL tiene un formato inválido. Debe ser: https://xxxxx.supabase.co');
    }
    
    // Validar formato básico de la API key (JWT típicamente empieza con eyJ)
    if (!supabaseAnonKey.startsWith('eyJ')) {
        console.warn('⚠️ VITE_SUPABASE_ANON_KEY podría estar incompleta o mal formateada. Debe empezar con "eyJ"');
    }
}

export const supabase =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey, {
              realtime: {
                  params: {
                      eventsPerSecond: 10
                  },
                  // Configuración mejorada para tiempo real
                  heartbeatIntervalMs: 30000, // Heartbeat cada 30 segundos
                  reconnectAfterMs: (tries: number) => {
                      // Reconexión exponencial: 1s, 2s, 4s, 8s, max 10s
                      return Math.min(1000 * Math.pow(2, tries), 10000);
                  }
              },
              // Configuración para PWA
              auth: {
                  persistSession: true,
                  autoRefreshToken: true,
                  detectSessionInUrl: true,
                  storage: window.localStorage,
                  storageKey: 'sb-auth-token'
              },
              global: {
                  headers: {
                      'x-client-info': 'sproject-pwa'
                  }
              }
          })
        : null;
