-- ============================================
-- LEADERBOARD FIX - MIGRATION FILE
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: UPDATE RLS POLICIES
-- ============================================

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Users can insert their own leaderboard entry" ON leaderboard_scores;

-- Create INSERT policy for authenticated users
CREATE POLICY "Users can insert their own leaderboard entry"
  ON leaderboard_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create additional INSERT policy to allow system inserts
CREATE POLICY "System can insert leaderboard entries"
  ON leaderboard_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure UPDATE policy exists
CREATE POLICY IF NOT EXISTS "Users can update their own leaderboard entry"
  ON leaderboard_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- Ensure SELECT policy exists
CREATE POLICY IF NOT EXISTS "Anyone can view leaderboard"
  ON leaderboard_scores FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- PART 2: UPDATE TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username text;
BEGIN
  -- Generate username if not provided
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username', 
    'user_' || substr(NEW.id::text, 1, 8)
  );
  
  -- Create user profile
  INSERT INTO user_profiles (id, username, email, name)
  VALUES (
    NEW.id,
    generated_username,
    NEW.email,
    NEW.raw_user_meta_data->>'name'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create user progress
  INSERT INTO user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create leaderboard entry
  INSERT INTO leaderboard_scores (
    user_id, 
    username, 
    total_score, 
    ctf_score, 
    phish_score, 
    code_score, 
    quiz_score, 
    firewall_score
  )
  VALUES (
    NEW.id,
    generated_username,
    0,
    0,
    0,
    0,
    0,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 3: BACKFILL EXISTING USERS
-- ============================================

-- Create leaderboard entries for any existing users who don't have one yet
INSERT INTO leaderboard_scores (
  user_id, 
  username, 
  total_score, 
  ctf_score, 
  phish_score, 
  code_score, 
  quiz_score, 
  firewall_score
)
SELECT 
  up.id,
  up.username,
  0,
  0,
  0,
  0,
  0,
  0
FROM user_profiles up
WHERE NOT EXISTS (
  SELECT 1 FROM leaderboard_scores ls WHERE ls.user_id = up.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total leaderboard entries created
SELECT COUNT(*) as total_leaderboard_entries FROM leaderboard_scores;

-- Check all leaderboard entries
SELECT user_id, username, total_score FROM leaderboard_scores ORDER BY total_score DESC LIMIT 10;

-- Check user profiles
SELECT id, username, email, name FROM user_profiles LIMIT 10;
