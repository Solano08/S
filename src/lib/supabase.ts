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
                  }
              }
          })
        : null;
