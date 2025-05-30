/*
  # Fix Achievement Triggers and Functions

  1. Changes
    - Add better error handling and logging
    - Fix transaction handling
    - Improve achievement checks
    - Add debugging information
    - Fix race conditions
    
  2. Purpose
    - Ensure achievements are awarded correctly
    - Fix issues with first-time achievements not being awarded
    - Improve reliability of the achievement system
*/

-- Drop existing functions to recreate them with fixes
DROP FUNCTION IF EXISTS check_cv_upload_achievement CASCADE;
DROP FUNCTION IF EXISTS check_education_achievement CASCADE;
DROP FUNCTION IF EXISTS check_work_achievement CASCADE;
DROP FUNCTION IF EXISTS check_profile_completion_achievement CASCADE;
DROP FUNCTION IF EXISTS award_achievement CASCADE;

-- Helper function to award achievements safely
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id uuid,
  p_achievement_name text
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_achievement_id uuid;
  v_debug_info text;
BEGIN
  -- Get achievement ID
  SELECT id INTO v_achievement_id
  FROM achievements
  WHERE name = p_achievement_name;

  IF v_achievement_id IS NULL THEN
    RAISE WARNING 'Achievement % not found for user %', p_achievement_name, p_user_id;
    RETURN;
  END IF;

  -- Debug info
  v_debug_info := format('Attempting to award achievement %s to user %s', p_achievement_name, p_user_id);
  RAISE NOTICE '%', v_debug_info;

  -- Insert achievement if it doesn't exist
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, v_achievement_id)
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  -- Confirm award
  IF FOUND THEN
    RAISE NOTICE 'Successfully awarded achievement % to user %', p_achievement_name, p_user_id;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error awarding achievement: %', SQLERRM;
END;
$$;

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
      PERFORM award_achievement(NEW.user_id, 'CV Subido');
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in check_cv_upload_achievement: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Education Achievement
CREATE OR REPLACE FUNCTION check_education_achievement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_count integer;
BEGIN
  -- Get count of existing education entries
  SELECT COUNT(*) INTO v_count
  FROM education
  WHERE user_id = NEW.user_id;

  -- Only award if this is the first entry (count = 1 because NEW is already inserted)
  IF v_count = 1 THEN
    -- Check if achievement hasn't been awarded yet
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.name = 'Educación Registrada'
    ) THEN
      PERFORM award_achievement(NEW.user_id, 'Educación Registrada');
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in check_education_achievement: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Work Experience Achievement
CREATE OR REPLACE FUNCTION check_work_achievement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_count integer;
BEGIN
  -- Get count of existing work experience entries
  SELECT COUNT(*) INTO v_count
  FROM work_experience
  WHERE user_id = NEW.user_id;

  -- Only award if this is the first entry (count = 1 because NEW is already inserted)
  IF v_count = 1 THEN
    -- Check if achievement hasn't been awarded yet
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = NEW.user_id AND a.name = 'Experiencia Laboral'
    ) THEN
      PERFORM award_achievement(NEW.user_id, 'Experiencia Laboral');
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in check_work_achievement: %', SQLERRM;
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
      PERFORM award_achievement(NEW.user_id, 'Perfil Completo');
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in check_profile_completion_achievement: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS check_cv_upload ON loggedusers;
DROP TRIGGER IF EXISTS check_profile_completion ON loggedusers;
DROP TRIGGER IF EXISTS check_first_education ON education;
DROP TRIGGER IF EXISTS check_first_work_experience ON work_experience;

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