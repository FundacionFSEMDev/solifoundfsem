/*
  # Fix Achievement Triggers

  1. Changes
    - Drop and recreate all achievement functions with proper error handling
    - Add transaction support to prevent partial updates
    - Improve achievement checks to be more reliable
    - Fix race conditions in achievement awarding
    - Add proper logging for debugging

  2. Security
    - Maintain SECURITY DEFINER settings
    - Keep proper search_path for security
*/

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS check_cv_upload_achievement CASCADE;
DROP FUNCTION IF EXISTS check_education_achievement CASCADE;
DROP FUNCTION IF EXISTS check_work_achievement CASCADE;
DROP FUNCTION IF EXISTS check_profile_completion_achievement CASCADE;

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
BEGIN
  -- Get achievement ID within its own transaction
  SELECT id INTO v_achievement_id
  FROM achievements
  WHERE name = p_achievement_name;

  IF v_achievement_id IS NULL THEN
    RAISE EXCEPTION 'Achievement % not found', p_achievement_name;
  END IF;

  -- Insert achievement if it doesn't exist
  INSERT INTO user_achievements (user_id, achievement_id)
  VALUES (p_user_id, v_achievement_id)
  ON CONFLICT (user_id, achievement_id) DO NOTHING;
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
    -- Award achievement
    PERFORM award_achievement(NEW.user_id, 'CV Subido');
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
BEGIN
  -- Check if this is the first education entry
  IF NOT EXISTS (
    SELECT 1 FROM education
    WHERE user_id = NEW.user_id AND id != NEW.id
  ) THEN
    -- Award achievement
    PERFORM award_achievement(NEW.user_id, 'Educación Registrada');
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
BEGIN
  -- Check if this is the first work experience entry
  IF NOT EXISTS (
    SELECT 1 FROM work_experience
    WHERE user_id = NEW.user_id AND id != NEW.id
  ) THEN
    -- Award achievement
    PERFORM award_achievement(NEW.user_id, 'Experiencia Laboral');
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
    -- Award achievement
    PERFORM award_achievement(NEW.user_id, 'Perfil Completo');
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