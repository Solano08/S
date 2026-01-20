-- Agregar columna 'completed' a las tablas tasks y events
-- Ejecuta este SQL en el SQL Editor de Supabase

-- Agregar columna completed a tasks
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false;

-- Agregar columna completed a events
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT false;
