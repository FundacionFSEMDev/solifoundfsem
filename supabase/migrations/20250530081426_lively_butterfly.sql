/*
  # Update achievements table structure
  
  1. Changes
    - Remove badge_url column since we'll generate badges dynamically
    - Update achievement descriptions
    
  2. Purpose
    - Simplify achievement storage
    - Improve achievement descriptions
*/

-- Remove badge_url column
ALTER TABLE achievements DROP COLUMN badge_url;

-- Update achievement descriptions
UPDATE achievements SET description = CASE name
  WHEN 'Perfil Completo' THEN '¡Has completado tu perfil con toda la información necesaria!'
  WHEN 'CV Subido' THEN '¡Has subido tu primer CV a la plataforma!'
  WHEN 'Educación Registrada' THEN '¡Has registrado tu primera formación académica!'
  WHEN 'Experiencia Laboral' THEN '¡Has añadido tu primera experiencia laboral!'
END
WHERE name IN ('Perfil Completo', 'CV Subido', 'Educación Registrada', 'Experiencia Laboral');