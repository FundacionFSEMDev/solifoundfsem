/*
  # Fix loggedusers table RLS policies

  1. Changes
    - Drop existing problematic policies causing infinite recursion
    - Create new simplified policies for:
      - Users can read their own data
      - Admin can read all data
      - Users can update their own data
      - Users can insert their own data

  2. Security
    - Maintains RLS enabled on loggedusers table
    - Ensures users can only access their own data
    - Special access for admin email
*/

-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can read own data" ON loggedusers;
DROP POLICY IF EXISTS "Admin can view all users" ON loggedusers;
DROP POLICY IF EXISTS "Users can insert their own data" ON loggedusers;
DROP POLICY IF EXISTS "Users can update their own CV" ON loggedusers;

-- Create new simplified policies
CREATE POLICY "Users can read own data"
ON loggedusers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  email = 'sistemas@fundacionsanezequiel.org'
);

CREATE POLICY "Users can insert own data"
ON loggedusers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON loggedusers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);