-- Eliminar objetivos cuyo nombre contiene BMW (ejecutar en SQL Editor de Supabase si lo prefieres manual)
DELETE FROM goals
WHERE name ILIKE '%BMW%';
