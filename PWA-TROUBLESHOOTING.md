# Solución de Problemas PWA - iPhone 13 Pro Max

## Problemas Comunes y Soluciones

### 1. La aplicación no se ve correctamente

**Solución:**
- Limpia el caché del navegador en Safari
- Ve a Configuración > Safari > Limpiar historial y datos de sitios web
- Cierra y vuelve a abrir Safari
- Recarga la aplicación

### 2. La aplicación tarda mucho en cargar

**Solución implementada:**
- ✅ Service Worker se registra después de 3 segundos (no bloquea)
- ✅ Precaché mínimo (solo index.html)
- ✅ Timeout en peticiones a Supabase (5 segundos)
- ✅ Carga de datos desde localStorage primero

**Si aún tarda:**
1. Verifica tu conexión a internet
2. Revisa la consola del navegador para errores
3. Desinstala y vuelve a instalar la PWA

### 3. Los datos no se muestran

**Solución:**
- La app carga datos desde localStorage primero (instantáneo)
- Si hay conexión, se actualizan desde Supabase
- Los valores por defecto evitan mostrar 0

**Verificar:**
- Abre la consola del navegador (Safari > Desarrollo > Consola Web)
- Busca mensajes de error
- Verifica que Supabase esté configurado correctamente

### 4. La aplicación se ve en blanco

**Posibles causas:**
1. **Service Worker bloqueando recursos:**
   - Solución: El SW ahora se registra después de 3 segundos
   - La app funciona sin SW si hay problemas

2. **CSS no carga:**
   - Verifica que `index.css` se esté cargando
   - Revisa la consola para errores 404

3. **JavaScript bloqueado:**
   - Verifica que no haya bloqueadores de contenido
   - Asegúrate de que JavaScript esté habilitado

**Solución rápida:**
```javascript
// En la consola del navegador:
// 1. Desregistrar SW
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

// 2. Limpiar caché
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// 3. Recargar
location.reload();
```

### 5. La aplicación no funciona offline

**Verificar:**
- Los datos se guardan automáticamente en localStorage
- El SW se registra en segundo plano
- Verifica en la consola: "✅ App lista para funcionar offline"

**Solución:**
- Espera a que el SW se registre (puede tardar unos segundos)
- Los datos se mantienen en localStorage incluso sin SW

## Verificación Rápida

### En Safari (iPhone):

1. **Abrir Consola Web:**
   - Conecta iPhone a Mac
   - En Mac: Safari > Desarrollo > [Tu iPhone] > Consola Web

2. **Verificar SW:**
   ```javascript
   navigator.serviceWorker.controller
   // Debe mostrar el SW registrado o null (ambos están bien)
   ```

3. **Verificar Datos:**
   ```javascript
   localStorage.getItem('app_cache_tasks')
   // Debe mostrar datos en JSON o null
   ```

4. **Verificar Caché:**
   ```javascript
   caches.keys()
   // Debe mostrar nombres de caché o array vacío
   ```

## Resetear Completamente

Si nada funciona, resetea todo:

1. **En Safari (iPhone):**
   - Configuración > Safari > Limpiar historial y datos
   - Configuración > Safari > Avanzado > Datos de sitios web > Eliminar todo

2. **Desinstalar PWA:**
   - Mantén presionado el icono de la app
   - Toca "Eliminar app"

3. **Reinstalar:**
   - Abre Safari
   - Ve a la URL de la app
   - Compartir > Agregar a pantalla de inicio

## Estado Actual de la Configuración

✅ **Service Worker:**
- Registro diferido (3 segundos después de la carga)
- No bloquea la carga inicial
- Precaché mínimo (solo index.html)

✅ **Caché de Datos:**
- localStorage para datos de la app
- Expiración: 1 hora
- Carga instantánea desde caché

✅ **Timeouts:**
- Supabase: 5 segundos
- Network: 3 segundos
- Valores por defecto si falla

✅ **Optimizaciones:**
- CSS inline en HTML (previene FOUC)
- Loading screen que se oculta rápido
- Overflow-x: hidden (previene scroll horizontal)

## Contacto y Soporte

Si el problema persiste:
1. Revisa la consola del navegador para errores específicos
2. Verifica que todos los archivos se estén cargando (Network tab)
3. Asegúrate de que estés usando HTTPS (o localhost)
