# Configuración de Realtime en Supabase

Para que los datos se actualicen automáticamente en tiempo real en todas las partes donde se abra la aplicación, necesitas habilitar Realtime en las tablas de Supabase.

## Pasos para habilitar Realtime:

1. **Ve al Dashboard de Supabase**
   - Accede a tu proyecto en https://supabase.com/dashboard

2. **Navega a Database → Replication**
   - En el menú lateral, ve a "Database"
   - Luego haz clic en "Replication"

3. **Habilita Realtime para cada tabla:**
   - Busca la tabla `tasks` y activa el toggle de Realtime
   - Busca la tabla `transactions` y activa el toggle de Realtime
   - Busca la tabla `events` y activa el toggle de Realtime
   - Busca la tabla `app_overview` y activa el toggle de Realtime

4. **Alternativa vía SQL (si tienes permisos):**
   ```sql
   -- Habilitar Realtime en las tablas
   ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
   ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
   ALTER PUBLICATION supabase_realtime ADD TABLE events;
   ALTER PUBLICATION supabase_realtime ADD TABLE app_overview;
   ```
   
   Ejecuta este SQL en el SQL Editor de Supabase si prefieres hacerlo desde ahí.

## ¿Cómo funciona?

Una vez habilitado Realtime:
- Cuando cualquier usuario agregue, edite o elimine datos (tareas, eventos, transacciones), todos los dispositivos/clientes conectados recibirán la actualización automáticamente
- Los cambios se sincronizan en tiempo real sin necesidad de refrescar la página
- Funciona en múltiples pestañas, dispositivos móviles, y diferentes navegadores simultáneamente

## Nota importante:

- Realtime está habilitado por defecto en los planes gratuitos de Supabase con límites razonables
- Los cambios en el código (`AppDataContext.tsx`) ya están implementados y listos para usar
- Solo necesitas habilitar Realtime en las tablas desde el dashboard
