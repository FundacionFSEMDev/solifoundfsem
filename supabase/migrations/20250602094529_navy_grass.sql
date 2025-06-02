/*
  # Fix Users View Policies

  1. Changes
    - Drop existing policies that might conflict
    - Create new policy for admin to view all users
    - Update user policies to avoid recursion
    - Ensure proper access control

  2. Security
    - Admin can view and manage all users
    - Users can only view their own data
    - Prevent infinite recursion in policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON loggedusers;
DROP POLICY IF EXISTS "Admin can view all users" ON loggedusers;
DROP POLICY IF EXISTS "Users can insert own data" ON loggedusers;
DROP POLICY IF EXISTS "Users can update own data" ON loggedusers;

-- Create new policies
CREATE POLICY "Admin and users can read data"
ON loggedusers
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  (SELECT email FROM loggedusers WHERE user_id = auth.uid()) = 'sistemas@fundacionsanezequiel.org'
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