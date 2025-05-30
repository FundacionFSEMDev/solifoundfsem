/*
  # Add CV storage to user profiles

  1. Changes
    - Add `cv_data` column to store CV file data (bytea for efficient binary storage)
    - Add `cv_filename` to store original filename
    - Add `cv_updated_at` to track last update

  2. Security
    - Maintain existing RLS policies
    - CV data is only accessible by the owner
*/

ALTER TABLE loggedusers
ADD COLUMN cv_data bytea,
ADD COLUMN cv_filename text,
ADD COLUMN cv_updated_at timestamptz DEFAULT now();

-- Update RLS policies to include new columns
CREATE POLICY "Users can update their own CV"
ON loggedusers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);