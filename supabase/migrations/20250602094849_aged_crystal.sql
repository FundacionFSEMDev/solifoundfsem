/*
  # Fix RLS policies for loggedusers table

  1. Changes
    - Remove existing RLS policies that cause recursion
    - Add new policies that:
      a. Allow users to read their own data
      b. Allow admin to read all data based on app_metadata
      c. Maintain existing insert/update policies
    
  2. Security
    - Policies use app_metadata for admin checks instead of querying loggedusers
    - Maintains row-level security
    - Preserves existing write permissions
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Admin and users can read data" ON public.loggedusers;
DROP POLICY IF EXISTS "Users can view their own data" ON public.loggedusers;

-- Create new SELECT policy that combines user and admin access
CREATE POLICY "Allow users to read own data and admins to read all"
  ON public.loggedusers
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin' = 'true'
  );

-- Recreate insert policy (in case it was dropped)
DROP POLICY IF EXISTS "Users can insert own data" ON public.loggedusers;
CREATE POLICY "Users can insert own data"
  ON public.loggedusers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Recreate update policy (in case it was dropped)
DROP POLICY IF EXISTS "Users can update own data" ON public.loggedusers;
CREATE POLICY "Users can update own data"
  ON public.loggedusers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);