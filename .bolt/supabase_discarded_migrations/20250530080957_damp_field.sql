/*
  # Fix achievement trigger security

  1. Changes
    - Add SECURITY DEFINER to check_profile_completion_achievement function
    - Update RLS policy for user_achievements table to allow system inserts
    - Ensure trigger function has proper permissions

  2. Security
    - Function runs with elevated privileges to bypass RLS
    - Only system can insert achievements
    - Users can only read their own achievements
*/

-- Drop existing trigger function
DROP FUNCTION IF EXISTS check_profile_completion_achievement();

-- Recreate function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION check_profile_completion_achievement()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if all profile fields are filled
  IF NEW.nacionalidad IS NOT NULL 
    AND NEW.residencia IS NOT NULL 
    AND NEW.tipo_documento IS NOT NULL 
    AND NEW.numero_documento IS NOT NULL 
    AND NEW.situacion_laboral IS NOT NULL 
  THEN
    -- Check if achievement already exists for this user
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
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
$$;

-- Drop existing trigger
DROP TRIGGER IF EXISTS check_profile_completion ON loggedusers;

-- Recreate trigger
CREATE TRIGGER check_profile_completion
  AFTER UPDATE ON loggedusers
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_completion_achievement();

-- Update RLS policies for user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "System can insert user achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;

-- Create new policies
CREATE POLICY "System can insert user achievements"
  ON user_achievements
  FOR INSERT
  TO postgres
  WITH CHECK (true);

CREATE POLICY "Users can view their own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);