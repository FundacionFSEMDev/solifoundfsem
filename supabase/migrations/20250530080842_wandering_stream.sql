/*
  # Fix ambiguous achievement_id column reference

  1. Changes
    - Update trigger function to properly qualify achievement_id column references
    - Ensure all table references are properly aliased
    - Add explicit table qualifiers to avoid ambiguity

  2. Security
    - No changes to RLS policies
    - Maintains existing security model
*/

CREATE OR REPLACE FUNCTION check_profile_completion_achievement()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all required fields are filled
  IF NEW.nacionalidad IS NOT NULL 
    AND NEW.residencia IS NOT NULL 
    AND NEW.tipo_documento IS NOT NULL 
    AND NEW.numero_documento IS NOT NULL 
    AND NEW.situacion_laboral IS NOT NULL 
  THEN
    -- Check if achievement doesn't already exist for this user
    IF NOT EXISTS (
      SELECT 1 
      FROM user_achievements ua
      JOIN achievements a ON a.id = ua.achievement_id
      WHERE ua.user_id = NEW.user_id 
      AND a.name = 'Perfil Completo'
    ) THEN
      -- Insert the achievement
      INSERT INTO user_achievements (user_id, achievement_id)
      SELECT NEW.user_id, a.id
      FROM achievements a
      WHERE a.name = 'Perfil Completo';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;