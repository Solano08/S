-- =====================================================
-- CREAR TABLA PROJECTS EN SUPABASE
-- =====================================================
-- Ejecuta este SQL en el SQL Editor de Supabase
-- =====================================================

-- Tabla: projects (Proyectos)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'completed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  template TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para actualizar updated_at en projects
DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) para projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura y escritura para projects
DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects"
  ON projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "public_insert_projects" ON projects;
CREATE POLICY "public_insert_projects"
  ON projects FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_projects" ON projects;
CREATE POLICY "public_update_projects"
  ON projects FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_projects" ON projects;
CREATE POLICY "public_delete_projects"
  ON projects FOR DELETE
  USING (true);

-- Habilitar Realtime en la tabla projects para sincronización en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
