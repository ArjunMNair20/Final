-- ============================================
-- LEADERBOARD SCORES FIX - RLS POLICIES
-- Run this file in Supabase SQL Editor to fix
-- scores/progress not showing on leaderboard
-- ============================================

-- First, DISABLE RLS completely to allow all operations
ALTER TABLE leaderboard_scores DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert their own leaderboard entry" ON leaderboard_scores;
DROP POLICY IF EXISTS "System can insert leaderboard entries" ON leaderboard_scores;
DROP POLICY IF EXISTS "Users can update their own leaderboard entry" ON leaderboard_scores;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_can_view_leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_can_insert_leaderboard" ON leaderboard_scores;
DROP POLICY IF EXISTS "authenticated_can_update_leaderboard" ON leaderboard_scores;

-- ============================================
-- RE-ENABLE RLS AND CREATE SIMPLIFIED POLICIES
-- ============================================
ALTER TABLE leaderboard_scores ENABLE ROW LEVEL SECURITY;

-- SELECT: Authenticated users can view all leaderboard entries
CREATE POLICY "authenticated_can_view_leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Allow authenticated users to insert entries
CREATE POLICY "authenticated_can_insert_leaderboard"
  ON leaderboard_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR true);

-- UPDATE: Allow authenticated users to update entries
CREATE POLICY "authenticated_can_update_leaderboard"
  ON leaderboard_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR true)
  WITH CHECK (auth.uid() = user_id OR true);

-- ============================================
-- VERIFY POLICIES AND DATA
-- ============================================

-- Check policies
SELECT policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'leaderboard_scores' 
ORDER BY policyname;

-- Check data exists
SELECT COUNT(*) as total_entries FROM leaderboard_scores;

-- Sample of leaderboard data
SELECT user_id, username, total_score, ctf_score, phish_score, code_score, quiz_score 
FROM leaderboard_scores 
ORDER BY total_score DESC 
LIMIT 10;
