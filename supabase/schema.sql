-- =====================================================
-- SCHEMA COMPLETO PARA S PROJECT - SUPABASE
-- =====================================================
-- Ejecuta este SQL completo en el SQL Editor de Supabase
-- =====================================================

-- Tabla: app_overview (Resumen financiero)
CREATE TABLE IF NOT EXISTS app_overview (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  balance NUMERIC NOT NULL DEFAULT 0,
  income NUMERIC NOT NULL DEFAULT 0,
  expenses NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: tasks (Tareas puntuales)
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  meta TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'Media',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: transactions (Transacciones financieras)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla: events (Eventos del calendario)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'Media',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
DROP TRIGGER IF EXISTS set_tasks_updated_at ON tasks;
CREATE TRIGGER set_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_app_overview_updated_at ON app_overview;
CREATE TRIGGER set_app_overview_updated_at
BEFORE UPDATE ON app_overview
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_events_updated_at ON events;
CREATE TRIGGER set_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE app_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura para app_overview
DROP POLICY IF EXISTS "public_read_app_overview" ON app_overview;
CREATE POLICY "public_read_app_overview"
  ON app_overview FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public_insert_app_overview" ON app_overview;
CREATE POLICY "public_insert_app_overview"
  ON app_overview FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_app_overview" ON app_overview;
CREATE POLICY "public_update_app_overview"
  ON app_overview FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Políticas de lectura y escritura para tasks
DROP POLICY IF EXISTS "public_read_tasks" ON tasks;
CREATE POLICY "public_read_tasks"
  ON tasks FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public_insert_tasks" ON tasks;
CREATE POLICY "public_insert_tasks"
  ON tasks FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_tasks" ON tasks;
CREATE POLICY "public_update_tasks"
  ON tasks FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_tasks" ON tasks;
CREATE POLICY "public_delete_tasks"
  ON tasks FOR DELETE
  USING (true);

-- Políticas de lectura y escritura para transactions
DROP POLICY IF EXISTS "public_read_transactions" ON transactions;
CREATE POLICY "public_read_transactions"
  ON transactions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public_insert_transactions" ON transactions;
CREATE POLICY "public_insert_transactions"
  ON transactions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_transactions" ON transactions;
CREATE POLICY "public_update_transactions"
  ON transactions FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_transactions" ON transactions;
CREATE POLICY "public_delete_transactions"
  ON transactions FOR DELETE
  USING (true);

-- Políticas de lectura y escritura para events
DROP POLICY IF EXISTS "public_read_events" ON events;
CREATE POLICY "public_read_events"
  ON events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public_insert_events" ON events;
CREATE POLICY "public_insert_events"
  ON events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_events" ON events;
CREATE POLICY "public_update_events"
  ON events FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_events" ON events;
CREATE POLICY "public_delete_events"
  ON events FOR DELETE
  USING (true);

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

-- Habilitar Realtime en las tablas para sincronización en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE app_overview;
ALTER PUBLICATION supabase_realtime ADD TABLE habits;

-- Insertar datos iniciales en app_overview (si no existen)
INSERT INTO app_overview (balance, income, expenses)
SELECT 880000, 1100000, 229900
WHERE NOT EXISTS (SELECT 1 FROM app_overview LIMIT 1);
