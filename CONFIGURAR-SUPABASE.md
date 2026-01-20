# 🔧 Guía Completa: Cómo Configurar Supabase

## 📝 Paso 1: Obtener tus Credenciales de Supabase

### Si NO tienes cuenta en Supabase:

1. Ve a **https://supabase.com**
2. Haz clic en **Start your project** o **Sign up**
3. Crea una cuenta (puedes usar GitHub, Google o email)
4. Confirma tu email

### Si ya tienes cuenta:

1. Ve a **https://app.supabase.com**
2. Inicia sesión

### Crear un Nuevo Proyecto:

1. Haz clic en **New Project**
2. Completa:
   - **Name**: "sproject" (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña fuerte (GUÁRDALA, la necesitarás después)
   - **Region**: Selecciona la más cercana a ti
   - **Pricing Plan**: Free tier (gratis)
3. Haz clic en **Create new project**
4. Espera 1-2 minutos a que se cree el proyecto

## 🔑 Paso 2: Obtener la URL y la Clave

Una vez que tu proyecto esté listo:

1. En el menú izquierdo, haz clic en **⚙️ Settings** (Configuración)
2. Haz clic en **API** (en el submenú de Settings)
3. Encontrarás dos cosas importantes:

   **A) Project URL:**
   - Sección: **Project URL**
   - Es algo como: `https://xxxxxxxxxxxxx.supabase.co`
   - **COPIA ESTA URL** (esta va en `VITE_SUPABASE_URL`)

   **B) anon public key:**
   - Sección: **Project API keys**
   - Busca **anon public**
   - Es una clave muy larga que empieza con `eyJ...`
   - Haz clic en el ícono de copiar al lado
   - **COPIA ESTA CLAVE** (esta va en `VITE_SUPABASE_ANON_KEY`)

## ✏️ Paso 3: Completar el archivo `.env`

1. Abre el archivo `.env` en la raíz del proyecto
2. Debería verse así:
   ```
   VITE_SUPABASE_URL=
   VITE_SUPABASE_ANON_KEY=
   ```

3. Completa con tus credenciales:
   ```
   VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0ODM5NzY4OCwiZXhwIjoxOTYzOTczNjg4fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   ⚠️ **IMPORTANTE**: 
   - NO dejes espacios alrededor del `=`
   - NO uses comillas `"` o `'`
   - Pega las credenciales tal cual las copiaste

4. Guarda el archivo

## 🗄️ Paso 4: Ejecutar el Schema SQL

1. En Supabase, ve a **SQL Editor** (menú izquierdo, ícono de `</>`)
2. Haz clic en **New query**
3. Abre el archivo `supabase/schema.sql` de este proyecto
4. **Copia TODO el contenido** del archivo
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **RUN** (o presiona `Ctrl+Enter` / `Cmd+Enter`)
7. Deberías ver: ✅ "Success. No rows returned"

## ✅ Paso 5: Verificar que Funciona

1. Reinicia tu servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Abre la aplicación en el navegador
3. Abre la consola del navegador (F12)
4. **NO deberías ver errores** de Supabase
5. Los datos deberían cargarse correctamente

## 🔍 Verificar en Supabase

Para confirmar que las tablas se crearon:

1. En Supabase, ve a **Table Editor** (menú izquierdo)
2. Deberías ver 4 tablas:
   - `app_overview`
   - `tasks`
   - `transactions`
   - `events`

## ❓ Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente las claves en el `.env`
- Asegúrate de no tener espacios extra
- Reinicia el servidor después de cambiar el `.env`

### Error al ejecutar SQL: "permission denied"
- Asegúrate de estar en el SQL Editor, no en otra sección
- Verifica que copiaste TODO el SQL completo
- Intenta ejecutar el SQL en partes (primero las tablas, luego las políticas)

### No se crean las tablas
- Ejecuta el SQL por partes:
  1. Primero ejecuta hasta la línea de CREATE TABLE events
  2. Luego ejecuta la parte de funciones y triggers
  3. Finalmente ejecuta las políticas RLS

## 📞 Ayuda Adicional

Si tienes problemas:
- Revisa la consola del navegador para errores específicos
- Verifica que el `.env` esté en la raíz del proyecto
- Asegúrate de reiniciar el servidor después de cambiar `.env`
