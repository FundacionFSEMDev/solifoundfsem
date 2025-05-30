/*
  # Update achievement trigger functions

  1. Changes
    - Modify trigger functions to check if it's the first achievement
    - Add count checks before awarding achievements
    - Improve error handling and validation

  2. Purpose
    - Ensure achievements are only awarded once
    - Fix issue with achievements not being awarded properly
*/

-- Update profile completion achievement check
CREATE OR REPLACE FUNCTION check_profile_completion_achievement()
RETURNS trigger AS $$
BEGIN
  -- Check if all required fields are filled and achievement hasn't been awarded yet
  IF NEW.nacionalidad IS NOT NULL AND
     NEW.residencia IS NOT NULL AND
     NEW.tipo_documento IS NOT NULL AND
     NEW.numero_documento IS NOT NULL AND
     NEW.situacion_laboral IS NOT NULL AND
     NOT EXISTS (
       SELECT 1 FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = NEW.user_id AND a.name = 'Perfil Completo'
     ) THEN
    -- Award the achievement
    PERFORM award_achievement(NEW.user_id, 'Perfil Completo');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update CV upload achievement check
CREATE OR REPLACE FUNCTION check_cv_upload_achievement()
RETURNS trigger AS $$
BEGIN
  -- Check if CV was uploaded and achievement hasn't been awarded yet
  IF NEW.cv_filename IS NOT NULL AND
     NOT EXISTS (
       SELECT 1 FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = NEW.user_id AND a.name = 'CV Subido'
     ) THEN
    -- Award the achievement
    PERFORM award_achievement(NEW.user_id, 'CV Subido');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update education achievement check
CREATE OR REPLACE FUNCTION check_education_achievement()
RETURNS trigger AS $$
BEGIN
  -- Check if this is the first education entry and achievement hasn't been awarded yet
  IF NOT EXISTS (
    SELECT 1 FROM education
    WHERE user_id = NEW.user_id AND id != NEW.id
  ) AND NOT EXISTS (
    SELECT 1 FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = NEW.user_id AND a.name = 'Educación Registrada'
  ) THEN
    -- Award the achievement
    PERFORM award_achievement(NEW.user_id, 'Educación Registrada');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update work experience achievement check
CREATE OR REPLACE FUNCTION check_work_achievement()
RETURNS trigger AS $$
BEGIN
  -- Check if this is the first work experience entry and achievement hasn't been awarded yet
  IF NOT EXISTS (
    SELECT 1 FROM work_experience
    WHERE user_id = NEW.user_id AND id != NEW.id
  ) AND NOT EXISTS (
    SELECT 1 FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = NEW.user_id AND a.name = 'Experiencia Laboral'
  ) THEN
    -- Award the achievement
    PERFORM award_achievement(NEW.user_id, 'Experiencia Laboral');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;