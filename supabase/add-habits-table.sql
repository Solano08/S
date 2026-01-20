-- =====================================================
-- TABLA HABITS - Sincronización en tiempo real
-- =====================================================
-- Ejecuta este SQL en el SQL Editor de Supabase
-- =====================================================

-- Tabla: habits (Hábitos)
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('non-negotiable', 'consider', 'basic-routine')),
  completed BOOLEAN NOT NULL DEFAULT false,
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

-- Trigger para actualizar updated_at en habits
DROP TRIGGER IF EXISTS set_habits_updated_at ON habits;
CREATE TRIGGER set_habits_updated_at
BEFORE UPDATE ON habits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) para habits
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura para habits
DROP POLICY IF EXISTS "public_read_habits" ON habits;
CREATE POLICY "public_read_habits"
  ON habits FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public_insert_habits" ON habits;
CREATE POLICY "public_insert_habits"
  ON habits FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_habits" ON habits;
CREATE POLICY "public_update_habits"
  ON habits FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_habits" ON habits;
CREATE POLICY "public_delete_habits"
  ON habits FOR DELETE
  USING (true);

-- Habilitar Realtime en la tabla habits
ALTER PUBLICATION supabase_realtime ADD TABLE habits;
