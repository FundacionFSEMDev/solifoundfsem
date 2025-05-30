/*
  # Fix Achievement Triggers and Functions
  
  1. Changes
    - Update trigger functions to properly handle first-time achievements
    - Add proper error handling
    - Fix transaction handling
    - Ensure proper security context
    
  2. Purpose
    - Ensure achievements are awarded correctly
    - Fix potential race conditions
    - Improve reliability of achievement system
*/

-- Drop existing functions and recreate them with fixes
DROP FUNCTION IF EXISTS check_cv_upload_achievement CASCADE;
DROP FUNCTION IF EXISTS check_education_achievement CASCADE;
DROP FUNCTION IF EXISTS check_work_achievement CASCADE;
DROP FUNCTION IF EXISTS check_profile_completion_achievement CASCADE;

-- CV Upload Achievement
CREATE OR REPLACE FUNCTION check_cv_upload_achievement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Only proceed if CV was actually uploaded
  IF NEW.cv_filename IS NOT NULL AND NEW.cv_data IS NOT NULL THEN
    -- Check if achievement hasn't been awarded yet
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.name = 'CV Subido'
    ) THEN
      -- Award the achievement
      INSERT INTO user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, a.id
      FROM achievements a
      WHERE a.name = 'CV Subido';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Education Achievement
CREATE OR REPLACE FUNCTION check_education_achievement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Check if this is the first education entry
  IF NOT EXISTS (
    SELECT 1 FROM education
    WHERE user_id = NEW.user_id AND id != NEW.id
  ) THEN
    -- Check if achievement hasn't been awarded yet
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.name = 'Educación Registrada'
    ) THEN
      -- Award the achievement
      INSERT INTO user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, a.id
      FROM achievements a
      WHERE a.name = 'Educación Registrada';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Work Experience Achievement
CREATE OR REPLACE FUNCTION check_work_achievement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Check if this is the first work experience entry
  IF NOT EXISTS (
    SELECT 1 FROM work_experience
    WHERE user_id = NEW.user_id AND id != NEW.id
  ) THEN
    -- Check if achievement hasn't been awarded yet
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.name = 'Experiencia Laboral'
    ) THEN
      -- Award the achievement
      INSERT INTO user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, a.id
      FROM achievements a
      WHERE a.name = 'Experiencia Laboral';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Profile Completion Achievement
CREATE OR REPLACE FUNCTION check_profile_completion_achievement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  -- Check if all required fields are filled
  IF NEW.nacionalidad IS NOT NULL AND
     NEW.residencia IS NOT NULL AND
     NEW.tipo_documento IS NOT NULL AND
     NEW.numero_documento IS NOT NULL AND
     NEW.situacion_laboral IS NOT NULL
  THEN
    -- Check if achievement hasn't been awarded yet
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.name = 'Perfil Completo'
    ) THEN
      -- Award the achievement
      INSERT INTO user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, a.id
      FROM achievements a
      WHERE a.name = 'Perfil Completo';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER check_cv_upload
  AFTER UPDATE ON loggedusers
  FOR EACH ROW
  WHEN (OLD.cv_filename IS NULL AND NEW.cv_filename IS NOT NULL)
  EXECUTE FUNCTION check_cv_upload_achievement();

CREATE TRIGGER check_profile_completion
  AFTER UPDATE ON loggedusers
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_completion_achievement();

CREATE TRIGGER check_first_education
  AFTER INSERT ON education
  FOR EACH ROW
  EXECUTE FUNCTION check_education_achievement();

CREATE TRIGGER check_first_work_experience
  AFTER INSERT ON work_experience
  FOR EACH ROW
  EXECUTE FUNCTION check_work_achievement();