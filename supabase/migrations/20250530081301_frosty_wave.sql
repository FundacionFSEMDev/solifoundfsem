/*
  # Update Achievement Badge URLs

  1. Changes
    - Update badge_url for all achievements to use proper badge images
    - Ensure badges are high quality and visually appealing
    - Use consistent badge style across all achievements

  2. Purpose
    - Improve visual appearance of achievement badges
    - Ensure all badge URLs are valid and accessible
    - Maintain consistent branding
*/

UPDATE achievements
SET badge_url = CASE name
  WHEN 'Perfil Completo' THEN 'https://raw.githubusercontent.com/solifound/achievement-badges/main/badges/profile-complete.png'
  WHEN 'CV Subido' THEN 'https://raw.githubusercontent.com/solifound/achievement-badges/main/badges/cv-uploaded.png'
  WHEN 'Educación Registrada' THEN 'https://raw.githubusercontent.com/solifound/achievement-badges/main/badges/education-added.png'
  WHEN 'Experiencia Laboral' THEN 'https://raw.githubusercontent.com/solifound/achievement-badges/main/badges/work-added.png'
END
WHERE name IN ('Perfil Completo', 'CV Subido', 'Educación Registrada', 'Experiencia Laboral');