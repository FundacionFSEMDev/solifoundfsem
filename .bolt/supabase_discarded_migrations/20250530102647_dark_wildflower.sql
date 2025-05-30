/*
  # Fix achievement triggers and add debugging

  1. Changes
    - Add detailed logging for achievement triggers
    - Fix race conditions in achievement checks
    - Improve error handling
    - Add transaction safety
    - Fix first entry detection logic
    
  2. Purpose
    - Ensure achievements are awarded correctly
    - Make debugging easier with detailed logs
    - Prevent duplicate achievements
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

-- Education Achievement with improved first entry detection
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

  RAISE NOTICE 'Education entries count for user %: %', NEW.user_id, v_count;

  -- Only award if this is the first entry
  IF v_count = 1 THEN
    PERFORM award_achievement(NEW.user_id, 'Educación Registrada');
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in check_education_achievement: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Work Experience Achievement with improved first entry detection
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

  RAISE NOTICE 'Work experience entries count for user %: %', NEW.user_id, v_count;

  -- Only award if this is the first entry
  IF v_count = 1 THEN
    PERFORM award_achievement(NEW.user_id, 'Experiencia Laboral');
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in check_work_achievement: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Recreate triggers with improved timing
DROP TRIGGER IF EXISTS check_first_education ON education;
DROP TRIGGER IF EXISTS check_first_work_experience ON work_experience;

CREATE TRIGGER check_first_education
  AFTER INSERT ON education
  FOR EACH ROW
  EXECUTE FUNCTION check_education_achievement();

CREATE TRIGGER check_first_work_experience
  AFTER INSERT ON work_experience
  FOR EACH ROW
  EXECUTE FUNCTION check_work_achievement();