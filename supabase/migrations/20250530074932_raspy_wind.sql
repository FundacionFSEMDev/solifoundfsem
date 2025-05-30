/*
  # Add test user achievements

  1. Purpose
    - Insert test achievements for a specific user to verify the achievements functionality
    - This will help us test the achievements display in the profile section

  2. Changes
    - Insert records into user_achievements table linking a user with existing achievements
*/

-- Function to add achievements for a specific user
CREATE OR REPLACE FUNCTION add_user_achievements(user_uuid uuid)
RETURNS void AS $$
DECLARE
  achievement_rec RECORD;
BEGIN
  -- Loop through all achievements and add them for the user
  FOR achievement_rec IN SELECT id FROM achievements
  LOOP
    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (user_uuid, achievement_rec.id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create policy to allow the function to insert achievements
CREATE POLICY "System can insert user achievements"
  ON user_achievements
  FOR INSERT
  TO postgres
  WITH CHECK (true);