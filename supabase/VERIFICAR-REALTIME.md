# 🔍 Verificar que Realtime está Funcionando

## ✅ Pasos para Verificar:

### 1. Verificar en el Table Editor de Supabase

1. Ve a **Table Editor** en tu dashboard de Supabase
2. Para cada tabla (`tasks`, `events`, `transactions`, `app_overview`):
   - Haz clic en la tabla
   - Busca el ícono de ondas/radar en la parte superior derecha
   - Debe estar **activado** (verde/coloreado)
   - Si no está activado, haz clic para activarlo

### 2. Verificar en la Consola del Navegador

1. Abre la aplicación en el navegador
2. Abre la consola del desarrollador (F12)
3. Deberías ver:
   ```
   ✅ Realtime: Todas las suscripciones activas
   ```

### 3. Probar la Sincronización

1. Abre la aplicación en **dos ventanas/pestañas diferentes** del mismo navegador
2. O en **dos dispositivos diferentes**
3. En una ventana, agrega un evento o tarea
4. En la otra ventana, deberías ver:
   ```
   📅 Realtime: cambio en events INSERT
   🔄 Recargando datos por cambio en tiempo real...
   ```
5. El evento debería aparecer automáticamente en la segunda ventana

### 4. Verificar las Publicaciones (si sigue sin funcionar)

Si después de los pasos anteriores aún no funciona, verifica las publicaciones:

1. Ve a **Database → Publications** en Supabase
2. Deberías ver `supabase_realtime`
3. Haz clic en `supabase_realtime`
4. Verifica que las tablas `tasks`, `events`, `transactions`, `app_overview` estén incluidas

Si no están incluidas, ejecuta este SQL en el SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE app_overview;
```

### 5. Ver Logs Detallados

En la consola del navegador, cuando hagas cambios deberías ver:
- `📝 Realtime: cambio en tasks INSERT/UPDATE/DELETE`
- `📅 Realtime: cambio en events INSERT/UPDATE/DELETE`
- `💰 Realtime: cambio en transactions INSERT/UPDATE/DELETE`
- `📊 Realtime: cambio en app_overview INSERT/UPDATE/DELETE`
- `🔄 Recargando datos por cambio en tiempo real...`

## ❌ Solución de Problemas

### No veo los logs de Realtime en la consola

- Verifica que Realtime esté habilitado en el Table Editor para cada tabla
- Verifica que las credenciales de Supabase estén correctas en el `.env`
- Reinicia el servidor de desarrollo

### Veo "CHANNEL_ERROR" en la consola

- Verifica que las tablas existan en Supabase
- Verifica que las políticas RLS permitan lectura
- Verifica que Realtime esté habilitado en cada tabla

### Los cambios no se sincronizan

- Asegúrate de que ambas ventanas estén conectadas a la misma instancia de Supabase
- Verifica que Realtime esté habilitado en **todas** las tablas necesarias
- Verifica que las suscripciones estén activas (debes ver "✅ Realtime: Todas las suscripciones activas")
