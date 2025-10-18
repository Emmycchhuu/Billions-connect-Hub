-- Enhanced referral system with automatic processing
-- This script updates the user creation trigger to handle referrals automatically

-- First, let's add referral-related columns to profiles if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT,
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_earnings INTEGER DEFAULT 0;

-- Create a function to generate referral codes
CREATE OR REPLACE FUNCTION generate_referral_code(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN 'BILLIONS-' || UPPER(SUBSTRING(user_id::TEXT, -8));
END;
$$ LANGUAGE plpgsql;

-- Update the trigger function to handle referrals
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  random_avatar TEXT;
  avatar_options TEXT[] := ARRAY[
    '/images/avatar-1.jpeg',
    '/images/avatar-2.jpeg',
    '/images/avatar-3.jpeg',
    '/images/avatar-4.jpeg',
    '/images/avatar-5.jpeg',
    '/images/toy-blue.png',
    '/images/toy-green.jpeg'
  ];
  referrer_id UUID;
  referral_code TEXT;
BEGIN
  -- Select a random avatar from the options
  random_avatar := avatar_options[floor(random() * array_length(avatar_options, 1) + 1)];
  
  -- Generate referral code for the new user
  referral_code := generate_referral_code(NEW.id);
  
  -- Check if there's a referral code in the user metadata
  IF NEW.raw_user_meta_data ? 'referral_code' AND NEW.raw_user_meta_data ->> 'referral_code' IS NOT NULL THEN
    -- Find the referrer by their referral code
    SELECT id INTO referrer_id 
    FROM profiles 
    WHERE referral_code = NEW.raw_user_meta_data ->> 'referral_code';
    
    -- If referrer found, update their stats and give them bonus points
    IF referrer_id IS NOT NULL THEN
      UPDATE profiles 
      SET 
        referral_count = referral_count + 1,
        referral_earnings = referral_earnings + 200,
        total_points = total_points + 200
      WHERE id = referrer_id;
    END IF;
  END IF;
  
  -- Create the new user's profile
  INSERT INTO public.profiles (
    id, 
    username, 
    total_points, 
    profile_picture,
    referral_code,
    referred_by
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    1000,  -- Starting points
    random_avatar,  -- Random profile picture
    referral_code,  -- Generated referral code
    referrer_id  -- Referrer ID if found
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create a function to process referrals after profile creation
CREATE OR REPLACE FUNCTION process_referral_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If this is a new profile with a referrer, give bonus points to the new user
  IF NEW.referred_by IS NOT NULL AND OLD IS NULL THEN
    UPDATE profiles 
    SET total_points = total_points + 100  -- Give 100 bonus points to new user
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for referral bonus processing
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION process_referral_bonus();

-- Create a view for referral stats
CREATE OR REPLACE VIEW referral_stats AS
SELECT 
  p.id,
  p.username,
  p.referral_code,
  p.referral_count,
  p.referral_earnings,
  COUNT(r.id) as successful_referrals
FROM profiles p
LEFT JOIN profiles r ON r.referred_by = p.id
GROUP BY p.id, p.username, p.referral_code, p.referral_count, p.referral_earnings;

-- Grant necessary permissions
GRANT SELECT ON referral_stats TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE ON profiles TO authenticated;
