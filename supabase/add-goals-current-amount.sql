-- =====================================================
-- AGREGAR CAMPO current_amount A LA TABLA GOALS
-- =====================================================
-- Ejecuta este SQL en el SQL Editor de Supabase
-- =====================================================
-- NOTA: Si la tabla goals no existe, primero ejecuta:
-- supabase/add-goals-table.sql
-- =====================================================

-- Agregar columna current_amount si no existe
DO $$
BEGIN
    -- Verificar si la tabla existe primero
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'goals'
    ) THEN
        -- Si la tabla existe, agregar la columna si no existe
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'goals' 
            AND column_name = 'current_amount'
        ) THEN
            ALTER TABLE goals 
            ADD COLUMN current_amount NUMERIC NOT NULL DEFAULT 0;
        END IF;
    ELSE
        -- Si la tabla no existe, mostrar un mensaje útil
        RAISE EXCEPTION 'La tabla goals no existe. Por favor, ejecuta primero supabase/add-goals-table.sql';
    END IF;
END $$;

-- Comentario: current_amount representa el dinero actual ahorrado para el objetivo
-- Siempre comienza en 0 cuando se crea un objetivo
