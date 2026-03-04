-- =====================================================
-- TABLA GOALS - Objetivos financieros
-- =====================================================
-- Ejecuta este SQL en el SQL Editor de Supabase
-- =====================================================

-- Tabla: goals (Objetivos)
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  target_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Media' CHECK (priority IN ('Alta', 'Media', 'Baja')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Función: Actualizar updated_at automáticamente (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en goals
DROP TRIGGER IF EXISTS set_goals_updated_at ON goals;
CREATE TRIGGER set_goals_updated_at
BEFORE UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) para goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura para goals
DROP POLICY IF EXISTS "public_read_goals" ON goals;
CREATE POLICY "public_read_goals"
  ON goals FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public_insert_goals" ON goals;
CREATE POLICY "public_insert_goals"
  ON goals FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_goals" ON goals;
CREATE POLICY "public_update_goals"
  ON goals FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_goals" ON goals;
CREATE POLICY "public_delete_goals"
  ON goals FOR DELETE
  USING (true);

-- Habilitar Realtime en la tabla goals
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE goals;
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE = '42710' THEN
            -- La tabla ya está en la publicación, continuar
            NULL;
        ELSE
            RAISE;
        END IF;
    END;
END $$;
