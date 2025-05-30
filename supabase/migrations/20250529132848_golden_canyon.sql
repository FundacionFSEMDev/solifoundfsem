/*
  # Add current job indicator

  1. Changes
    - Add `is_current_job` boolean column to `work_experience` table
    - Set default value to false
    - Make column non-nullable

  2. Purpose
    - Allow users to indicate if they are currently working at a position
    - Helps with displaying "Present" instead of end date when job is current
*/

ALTER TABLE work_experience 
ADD COLUMN is_current_job BOOLEAN NOT NULL DEFAULT false;