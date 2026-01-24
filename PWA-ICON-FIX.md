# 🔧 Solución para que aparezca el nuevo icono en el móvil

## Problema
El icono no aparece porque el navegador tiene caché del manifest y los iconos anteriores.

## Solución paso a paso

### Para Android (Chrome/Edge):

1. **Desinstalar la PWA actual:**
   - Abre Chrome/Edge en tu móvil
   - Ve a Configuración > Aplicaciones > Todas las aplicaciones
   - Busca "S" o "Personal Hub"
   - Toca "Desinstalar"

2. **Limpiar caché del navegador:**
   - Abre Chrome/Edge
   - Ve a Configuración > Privacidad y seguridad > Borrar datos de navegación
   - Marca "Imágenes y archivos en caché"
   - Toca "Borrar datos"

3. **Reinstalar la PWA:**
   - Abre la URL de tu app en el navegador
   - Cuando aparezca el banner "Agregar a pantalla de inicio", tócalo
   - O ve al menú (3 puntos) > "Agregar a pantalla de inicio"

### Para iOS (Safari):

1. **Eliminar el acceso directo actual:**
   - Mantén presionado el icono de la app en la pantalla de inicio
   - Toca "Eliminar app"
   - Confirma

2. **Limpiar caché de Safari:**
   - Ve a Configuración > Safari
   - Toca "Borrar historial y datos de sitios web"
   - Confirma

3. **Reagregar a pantalla de inicio:**
   - Abre Safari y navega a tu app
   - Toca el botón de compartir (cuadrado con flecha)
   - Toca "Agregar a pantalla de inicio"
   - Verifica que el icono sea el nuevo

### Verificación rápida:

1. Abre la app en el navegador del móvil
2. Ve a: `http://tu-ip:5173/manifest.json` (reemplaza con tu IP)
3. Verifica que los iconos estén listados correctamente
4. Abre directamente: `http://tu-ip:5173/pwa-512x512.png`
5. Deberías ver el icono con la "S" estilizada

### Si aún no funciona:

1. **Reinicia el servidor de desarrollo:**
   ```bash
   # Detén el servidor (Ctrl+C)
   npm run dev
   ```

2. **Verifica que los iconos existan:**
   - Los archivos deben estar en `public/`:
     - `pwa-192x192.png`
     - `pwa-512x512.png`
     - `apple-touch-icon.png`

3. **Fuerza recarga en el navegador:**
   - En Chrome: Mantén presionado el botón de recargar > "Vaciar caché y volver a cargar"
   - En Safari: Mantén presionado el botón de recargar > "Recargar sin caché"

### Nota importante:
El navegador cachea agresivamente los manifests de PWA. Si ya tenías la app instalada, **debes desinstalarla primero** antes de reinstalarla para ver el nuevo icono.
