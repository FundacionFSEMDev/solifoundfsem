/*
  # Add Achievements System

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key) - Achievement identifier
      - `name` (text) - Achievement name
      - `description` (text) - Achievement description
      - `badge_url` (text) - URL to badge image
      - `criteria` (jsonb) - Conditions to earn the achievement
      - `created_at` (timestamptz) - Creation timestamp

    - `user_achievements`
      - `id` (uuid, primary key) - Entry identifier
      - `user_id` (uuid) - Reference to auth.users
      - `achievement_id` (uuid) - Reference to achievements
      - `earned_at` (timestamptz) - When the achievement was earned

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  badge_url text NOT NULL,
  criteria jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  achievement_id uuid REFERENCES achievements(id) NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements table
CREATE POLICY "Anyone can view achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_achievements table
CREATE POLICY "Users can view their own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert some initial achievements
INSERT INTO achievements (name, description, badge_url, criteria) VALUES
  (
    'Perfil Completo',
    'Has completado toda tu información personal',
    'https://raw.githubusercontent.com/fsefidabi/achievement-badges/main/public/profile-complete.png',
    '{"type": "profile_completion", "required_fields": ["nacionalidad", "residencia", "tipo_documento", "numero_documento", "situacion_laboral"]}'
  ),
  (
    'CV Subido',
    'Has subido tu primer CV',
    'https://raw.githubusercontent.com/fsefidabi/achievement-badges/main/public/cv-uploaded.png',
    '{"type": "cv_upload", "required": true}'
  ),
  (
    'Educación Registrada',
    'Has añadido tu primera formación',
    'https://raw.githubusercontent.com/fsefidabi/achievement-badges/main/public/education-added.png',
    '{"type": "education_entries", "min_count": 1}'
  ),
  (
    'Experiencia Laboral',
    'Has añadido tu primera experiencia laboral',
    'https://raw.githubusercontent.com/fsefidabi/achievement-badges/main/public/work-added.png',
    '{"type": "work_entries", "min_count": 1}'
  );