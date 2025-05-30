/*
  # Add Achievement Trigger Functions
  
  1. New Functions
    - check_profile_completion_achievement: Awards achievement when all profile fields are filled
    - check_cv_upload_achievement: Awards achievement when CV is uploaded
    - check_education_achievement: Awards achievement when first education entry is added
    - check_work_achievement: Awards achievement when first work experience is added
    
  2. New Triggers
    - Trigger for loggedusers table updates
    - Trigger for education inserts
    - Trigger for work_experience inserts
*/

-- Function to award an achievement
CREATE OR REPLACE FUNCTION award_achievement(
  user_uuid uuid,
  achievement_name text
)
RETURNS void AS $$
DECLARE
  achievement_id uuid;
BEGIN
  -- Get the achievement ID
  SELECT id INTO achievement_id
  FROM achievements
  WHERE name = achievement_name;

  -- Insert the user achievement if it doesn't exist
  IF achievement_id IS NOT NULL THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (user_uuid, achievement_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Profile completion achievement check
CREATE OR REPLACE FUNCTION check_profile_completion_achievement()
RETURNS trigger AS $$
BEGIN
  -- Check if all required fields are filled
  IF NEW.nacionalidad IS NOT NULL AND
     NEW.residencia IS NOT NULL AND
     NEW.tipo_documento IS NOT NULL AND
     NEW.numero_documento IS NOT NULL AND
     NEW.situacion_laboral IS NOT NULL THEN
    -- Award the achievement
    PERFORM award_achievement(NEW.user_id, 'Perfil Completo');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CV upload achievement check
CREATE OR REPLACE FUNCTION check_cv_upload_achievement()
RETURNS trigger AS $$
BEGIN
  -- Check if CV was uploaded
  IF NEW.cv_filename IS NOT NULL AND NEW.cv_data IS NOT NULL THEN
    -- Award the achievement
    PERFORM award_achievement(NEW.user_id, 'CV Subido');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Education achievement check
CREATE OR REPLACE FUNCTION check_education_achievement()
RETURNS trigger AS $$
BEGIN
  -- Award achievement for first education entry
  PERFORM award_achievement(NEW.user_id, 'Educación Registrada');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Work experience achievement check
CREATE OR REPLACE FUNCTION check_work_achievement()
RETURNS trigger AS $$
BEGIN
  -- Award achievement for first work experience entry
  PERFORM award_achievement(NEW.user_id, 'Experiencia Laboral');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER check_profile_completion
  AFTER UPDATE ON loggedusers
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_completion_achievement();

CREATE TRIGGER check_cv_upload
  AFTER UPDATE ON loggedusers
  FOR EACH ROW
  WHEN (OLD.cv_filename IS NULL AND NEW.cv_filename IS NOT NULL)
  EXECUTE FUNCTION check_cv_upload_achievement();

CREATE TRIGGER check_first_education
  AFTER INSERT ON education
  FOR EACH ROW
  EXECUTE FUNCTION check_education_achievement();

CREATE TRIGGER check_first_work_experience
  AFTER INSERT ON work_experience
  FOR EACH ROW
  EXECUTE FUNCTION check_work_achievement();