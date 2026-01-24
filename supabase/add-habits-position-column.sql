-- Agregar columna position a la tabla habits para reordenamiento
ALTER TABLE habits 
ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Actualizar position basado en created_at para hábitos existentes
UPDATE habits 
SET position = subquery.row_number
FROM (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at ASC) as row_number
    FROM habits
) AS subquery
WHERE habits.id = subquery.id;

-- Crear índice para mejorar el rendimiento de las consultas ordenadas
CREATE INDEX IF NOT EXISTS idx_habits_category_position ON habits(category, position);
