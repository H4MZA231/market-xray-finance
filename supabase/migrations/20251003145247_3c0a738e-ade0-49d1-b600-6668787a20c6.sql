-- Drop the unused profiles_backup table to eliminate security risk
-- This table contains sensitive user data but has no RLS protection
-- and is not used anywhere in the application

DROP TABLE IF EXISTS public.profiles_backup CASCADE;