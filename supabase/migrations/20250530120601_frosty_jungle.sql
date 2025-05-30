/*
  # Remove achievements system
  
  This migration removes the achievements and user_achievements tables along with their related functions and triggers.
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS check_profile_completion ON loggedusers;
DROP TRIGGER IF EXISTS check_first_education ON education;
DROP TRIGGER IF EXISTS check_first_work_experience ON work_experience;

-- Drop functions
DROP FUNCTION IF EXISTS check_profile_completion_achievement();
DROP FUNCTION IF EXISTS check_education_achievement();
DROP FUNCTION IF EXISTS check_work_achievement();

-- Drop tables (user_achievements first due to foreign key constraint)
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;