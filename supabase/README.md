# Configuración de Supabase

## 1. Crear archivo .env

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

## 2. Ejecutar el Schema SQL

### Opción A: Desde el Dashboard de Supabase (Recomendado)

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia el contenido completo de `schema.sql`
5. Pégalo en el editor y haz clic en **Run**

### Opción B: Usando Supabase CLI

Si tienes Supabase CLI instalado:

```bash
supabase db reset
# O
psql -h tu-host -U postgres -d postgres -f supabase/schema.sql
```

## 3. Verificar la configuración

Una vez configurado, reinicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación verificará automáticamente la conexión a Supabase y cargará los datos.

## Estructura de la Base de Datos

El schema crea las siguientes tablas:

- **app_overview**: Resumen financiero (balance, income, expenses)
- **tasks**: Tareas puntuales
- **transactions**: Transacciones financieras
- **events**: Eventos del calendario
- **habits**: Hábitos
- **projects**: Proyectos

Cada tabla tiene Row Level Security (RLS) habilitado con políticas públicas para lectura y escritura.

## ⚠️ IMPORTANTE: Crear la tabla Projects

Si recibes un error que dice "Could not find the table 'public.projects'", necesitas crear la tabla:

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Abre el archivo `supabase/add-projects-table.sql` de este proyecto
5. Copia todo el contenido
6. Pégalo en el SQL Editor de Supabase
7. Haz clic en **Run** (o presiona Ctrl+Enter)
8. Deberías ver un mensaje de éxito
9. Recarga la aplicación en tu navegador
