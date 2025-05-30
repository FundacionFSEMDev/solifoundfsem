/*
  # Create loggedusers table

  1. New Table
    - `loggedusers`
      - `id` (uuid, primary key) - User's unique identifier
      - `nombre` (text) - User's first name
      - `apellido` (text) - User's last name
      - `email` (text, unique) - User's email address
      - `telefono` (text) - User's phone number
      - `gdpr_accepted` (text) - GDPR acceptance status ('SI' or 'NO')
      - `created_at` (timestamptz) - Registration timestamp
      - `user_id` (uuid) - Reference to auth.users

  2. Security
    - Enable RLS
    - Add policies for:
      - Insert: Allow users to insert their own data
      - Select: Users can only read their own data
*/

CREATE TABLE IF NOT EXISTS loggedusers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text NOT NULL,
  email text UNIQUE NOT NULL,
  telefono text NOT NULL,
  gdpr_accepted text NOT NULL CHECK (gdpr_accepted IN ('SI', 'NO')),
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE loggedusers ENABLE ROW LEVEL SECURITY;

-- Policy for inserting own data
CREATE POLICY "Users can insert their own data" 
ON loggedusers 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy for reading own data
CREATE POLICY "Users can read own data" 
ON loggedusers 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);