# Guía de Configuración - S Project

## 📋 Configuración Inicial

### 1. Crear archivo `.env`

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Cómo obtener tus credenciales de Supabase:**

1. Ve a https://app.supabase.com
2. Crea un proyecto nuevo o selecciona uno existente
3. Ve a **Settings** → **API**
4. Copia **Project URL** y pégalo en `VITE_SUPABASE_URL`
5. Copia **anon/public** key y pégalo en `VITE_SUPABASE_ANON_KEY`

### 2. Configurar la Base de Datos

#### Opción A: Desde el Dashboard de Supabase (Más fácil)

1. En tu proyecto de Supabase, ve a **SQL Editor**
2. Haz clic en **New Query**
3. Abre el archivo `supabase/schema.sql` de este proyecto
4. Copia todo el contenido
5. Pégalo en el editor SQL de Supabase
6. Haz clic en **Run** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)

#### Opción B: Usando Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase db reset

# O ejecutar directamente
supabase db push
```

### 3. Verificar la Configuración

Una vez configurado, reinicia tu servidor de desarrollo:

```bash
npm run dev
```

La aplicación:
- ✅ Verificará automáticamente la conexión a Supabase
- ✅ Inicializará los datos si las tablas están vacías
- ✅ Cargará todos los datos existentes
- ✅ Usará datos locales si Supabase no está configurado

## 🔍 Verificación

Para verificar que todo funciona:

1. Abre la consola del navegador (F12)
2. No deberías ver errores relacionados con Supabase
3. Los datos deberían cargarse correctamente en la aplicación

## 📁 Estructura de la Base de Datos

El schema crea las siguientes tablas:

- **app_overview**: Resumen financiero (balance, ingresos, gastos)
- **tasks**: Tareas puntuales
- **transactions**: Transacciones financieras
- **events**: Eventos del calendario

Todas las tablas tienen Row Level Security (RLS) habilitado con políticas públicas para permitir lectura y escritura.

## ⚠️ Notas Importantes

- El archivo `.env` NO debe subirse a Git (ya está en .gitignore)
- Usa `.env.example` como referencia si compartes el proyecto
- Los datos se inicializan automáticamente cuando la app detecta tablas vacías
- Si no configuras Supabase, la app funcionará con datos locales
