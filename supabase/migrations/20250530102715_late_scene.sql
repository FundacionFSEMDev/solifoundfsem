/*
  # Fix Achievement Triggers

  1. Changes
    - Improve first entry detection logic for education and work experience
    - Add transaction safety
    - Add detailed logging
    - Fix race conditions
    - Improve error handling

  2. Purpose
    - Ensure achievements are properly awarded when adding first entries
    - Fix issues with achievement triggers not firing correctly
*/

-- Drop existing functions to recreate them with fixes
DROP FUNCTION IF EXISTS check_education_achievement CASCADE;
DROP FUNCTION IF EXISTS check_work_achievement CASCADE;

-- Education Achievement with transaction safety
CREATE OR REPLACE FUNCTION check_education_achievement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_achievement_id uuid;
  v_existing_count integer;
BEGIN
  -- Start transaction
  BEGIN
    -- Lock the education table to prevent race conditions
    LOCK TABLE education IN SHARE MODE;
    
    -- Count existing entries excluding the new one
    SELECT COUNT(*) INTO v_existing_count
    FROM education
    WHERE user_id = NEW.user_id
    AND id != NEW.id;

    RAISE NOTICE 'Existing education entries for user %: %', NEW.user_id, v_existing_count;

    -- If this is the first entry
    IF v_existing_count = 0 THEN
      -- Get achievement ID
      SELECT id INTO v_achievement_id
      FROM achievements
      WHERE name = 'Educación Registrada';

      IF v_achievement_id IS NULL THEN
        RAISE WARNING 'Achievement "Educación Registrada" not found';
        RETURN NEW;
      END IF;

      -- Insert achievement if not already awarded
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (NEW.user_id, v_achievement_id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;

      IF FOUND THEN
        RAISE NOTICE 'Awarded education achievement to user %', NEW.user_id;
      END IF;
    END IF;

    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in check_education_achievement: %', SQLERRM;
    RETURN NEW;
  END;
END;
$$;

-- Work Experience Achievement with transaction safety
CREATE OR REPLACE FUNCTION check_work_achievement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_achievement_id uuid;
  v_existing_count integer;
BEGIN
  -- Start transaction
  BEGIN
    -- Lock the work_experience table to prevent race conditions
    LOCK TABLE work_experience IN SHARE MODE;
    
    -- Count existing entries excluding the new one
    SELECT COUNT(*) INTO v_existing_count
    FROM work_experience
    WHERE user_id = NEW.user_id
    AND id != NEW.id;

    RAISE NOTICE 'Existing work experience entries for user %: %', NEW.user_id, v_existing_count;

    -- If this is the first entry
    IF v_existing_count = 0 THEN
      -- Get achievement ID
      SELECT id INTO v_achievement_id
      FROM achievements
      WHERE name = 'Experiencia Laboral';

      IF v_achievement_id IS NULL THEN
        RAISE WARNING 'Achievement "Experiencia Laboral" not found';
        RETURN NEW;
      END IF;

      -- Insert achievement if not already awarded
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (NEW.user_id, v_achievement_id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;

      IF FOUND THEN
        RAISE NOTICE 'Awarded work experience achievement to user %', NEW.user_id;
      END IF;
    END IF;

    RETURN NEW;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in check_work_achievement: %', SQLERRM;
    RETURN NEW;
  END;
END;
$$;

-- Recreate triggers
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