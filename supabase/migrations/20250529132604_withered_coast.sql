/*
  # Add Education and Work Experience Tables

  1. New Tables
    - `education`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `titulo` (text)
      - `institucion` (text)
      - `fecha_inicio` (date)
      - `fecha_fin` (date, nullable)
      - `descripcion` (text)
      - `created_at` (timestamptz)

    - `work_experience`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `empresa` (text)
      - `puesto` (text)
      - `fecha_inicio` (date)
      - `fecha_fin` (date, nullable)
      - `descripcion` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create education table
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  titulo text NOT NULL,
  institucion text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for education
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Policies for education table
CREATE POLICY "Users can create their own education entries" 
ON education FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own education entries" 
ON education FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own education entries" 
ON education FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education entries" 
ON education FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create work experience table
CREATE TABLE IF NOT EXISTS work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  empresa text NOT NULL,
  puesto text NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date,
  descripcion text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for work_experience
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;

-- Policies for work_experience table
CREATE POLICY "Users can create their own work experience entries" 
ON work_experience FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own work experience entries" 
ON work_experience FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own work experience entries" 
ON work_experience FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own work experience entries" 
ON work_experience FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);