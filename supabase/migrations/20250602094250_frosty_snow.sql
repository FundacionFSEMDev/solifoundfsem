/*
  # Add admin policy for loggedusers table

  1. Changes
    - Add policy to allow admin user to view all users
    - Admin is identified by email 'sistemas@fundacionsanezequiel.org'

  2. Security
    - Only admin can view all users
    - Maintains existing user policies
*/

-- Add policy for admin to view all users
CREATE POLICY "Admin can view all users" 
ON loggedusers 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM loggedusers admin 
    WHERE admin.user_id = auth.uid() 
    AND admin.email = 'sistemas@fundacionsanezequiel.org'
  )
);