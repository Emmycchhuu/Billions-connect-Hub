-- Add Twitter username field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS twitter_username TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_twitter_username ON profiles(twitter_username);
