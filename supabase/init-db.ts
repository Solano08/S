import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️  Supabase no está configurado completamente.');
    console.warn('Para ejecutar este script, necesitas SUPABASE_SERVICE_ROLE_KEY en tu .env');
    process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeDatabase() {
    try {
        console.log('🔄 Inicializando base de datos...');

        // Leer el archivo SQL
        const fs = await import('fs/promises');
        const sqlContent = await fs.readFile('./supabase/schema.sql', 'utf-8');

        // Ejecutar el SQL usando rpc o ejecución directa
        // Nota: Esto requiere permisos de service_role
        const { error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });

        if (error) {
            // Si no existe la función exec_sql, intentar ejecutar directamente
            console.log('⚠️  No se puede ejecutar SQL automáticamente.');
            console.log('📝 Por favor, ejecuta el SQL manualmente en el dashboard de Supabase:');
            console.log('   1. Ve a https://app.supabase.com');
            console.log('   2. Selecciona tu proyecto');
            console.log('   3. Ve a SQL Editor');
            console.log('   4. Copia y pega el contenido de supabase/schema.sql');
            console.log('   5. Ejecuta el script');
            return;
        }

        console.log('✅ Base de datos inicializada correctamente!');
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        console.log('📝 Por favor, ejecuta el SQL manualmente desde el dashboard de Supabase.');
    }
}

// Ejecutar solo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeDatabase();
}
