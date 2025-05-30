/*
  # Update achievements system
  
  1. Changes
    - Remove "CV Subido" achievement
    - Update achievement triggers for:
      - Complete Profile
      - Education Added
      - Work Experience Added
  
  2. New Triggers
    - check_profile_completion: Checks if all user fields are filled
    - check_education_achievement: Checks if user has added education entries
    - check_work_achievement: Checks if user has added work experience entries
*/

-- First, delete the "CV Subido" achievement
DELETE FROM achievements WHERE name = 'CV Subido';

-- Update or create achievements
DO $$ 
BEGIN
  -- Profile completion achievement
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Perfil Completo') THEN
    INSERT INTO achievements (name, description, criteria)
    VALUES (
      'Perfil Completo',
      'Has completado toda tu información personal',
      '{"type": "profile_completion"}'
    );
  END IF;

  -- Education achievement
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Educación Registrada') THEN
    INSERT INTO achievements (name, description, criteria)
    VALUES (
      'Educación Registrada',
      'Has registrado tu formación académica',
      '{"type": "education_added"}'
    );
  END IF;

  -- Work experience achievement
  IF NOT EXISTS (SELECT 1 FROM achievements WHERE name = 'Experiencia Laboral') THEN
    INSERT INTO achievements (name, description, criteria)
    VALUES (
      'Experiencia Laboral',
      'Has registrado tu experiencia laboral',
      '{"type": "work_added"}'
    );
  END IF;
END $$;

-- Create or replace the profile completion check function
CREATE OR REPLACE FUNCTION check_profile_completion_achievement()
RETURNS TRIGGER AS $$
DECLARE
  achievement_id uuid;
BEGIN
  -- Check if all required fields are filled
  IF NEW.nombre IS NOT NULL AND 
     NEW.apellido IS NOT NULL AND 
     NEW.email IS NOT NULL AND 
     NEW.telefono IS NOT NULL AND 
     NEW.nacionalidad IS NOT NULL AND 
     NEW.residencia IS NOT NULL AND 
     NEW.tipo_documento IS NOT NULL AND 
     NEW.numero_documento IS NOT NULL AND 
     NEW.situacion_laboral IS NOT NULL THEN
    
    -- Get the achievement ID
    SELECT id INTO achievement_id FROM achievements WHERE name = 'Perfil Completo';
    
    -- Insert the achievement if not already earned
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = NEW.user_id AND achievement_id = achievement_id
    ) THEN
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (NEW.user_id, achievement_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the education achievement check function
CREATE OR REPLACE FUNCTION check_education_achievement()
RETURNS TRIGGER AS $$
DECLARE
  achievement_id uuid;
BEGIN
  -- Get the achievement ID
  SELECT id INTO achievement_id FROM achievements WHERE name = 'Educación Registrada';
  
  -- Insert the achievement if not already earned
  IF NOT EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_id = NEW.user_id AND achievement_id = achievement_id
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, achievement_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the work experience achievement check function
CREATE OR REPLACE FUNCTION check_work_achievement()
RETURNS TRIGGER AS $$
DECLARE
  achievement_id uuid;
BEGIN
  -- Get the achievement ID
  SELECT id INTO achievement_id FROM achievements WHERE name = 'Experiencia Laboral';
  
  -- Insert the achievement if not already earned
  IF NOT EXISTS (
    SELECT 1 FROM user_achievements 
    WHERE user_id = NEW.user_id AND achievement_id = achievement_id
  ) THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (NEW.user_id, achievement_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS check_cv_upload ON loggedusers;
DROP TRIGGER IF EXISTS check_profile_completion ON loggedusers;
DROP TRIGGER IF EXISTS check_first_education ON education;
DROP TRIGGER IF EXISTS check_first_work_experience ON work_experience;

-- Create new triggers
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