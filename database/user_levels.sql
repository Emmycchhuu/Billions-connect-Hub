-- User Levels System
-- Add level and experience columns to profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_games_played INTEGER DEFAULT 0;

-- Level requirements (experience needed for each level) - Progressive scaling
-- Level 1: 0-99 XP (default)
-- Level 2: 100-249 XP  
-- Level 3: 250-449 XP (chat access)
-- Level 4: 450-699 XP
-- Level 5: 700-999 XP
-- Level 6: 1000-1349 XP
-- Level 7: 1350-1749 XP
-- Level 8: 1750-2199 XP
-- Level 9: 2200-2699 XP
-- Level 10: 2700-3249 XP
-- Level 11: 3250-3849 XP
-- Level 12: 3850-4499 XP
-- Level 13: 4500-5199 XP
-- Level 14: 5200-5949 XP
-- Level 15: 5950-6749 XP
-- Level 16: 6750-7599 XP
-- Level 17: 7600-8499 XP
-- Level 18: 8500-9449 XP
-- Level 19: 9450-10449 XP
-- Level 20: 10450+ XP (Max level)

-- Experience points awarded for different activities:
-- - Find the Impostor: 10 XP per game
-- - Billions Spin: 5 XP per game  
-- - Billions Quiz: 8 XP per game
-- - Referral: 50 XP per successful referral
-- - Daily login: 5 XP (can be implemented later)

-- Function to calculate level based on experience
CREATE OR REPLACE FUNCTION calculate_level(exp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  CASE 
    WHEN exp < 100 THEN RETURN 1;
    WHEN exp < 250 THEN RETURN 2;
    WHEN exp < 450 THEN RETURN 3;
    WHEN exp < 700 THEN RETURN 4;
    WHEN exp < 1000 THEN RETURN 5;
    WHEN exp < 1350 THEN RETURN 6;
    WHEN exp < 1750 THEN RETURN 7;
    WHEN exp < 2200 THEN RETURN 8;
    WHEN exp < 2700 THEN RETURN 9;
    WHEN exp < 3250 THEN RETURN 10;
    WHEN exp < 3850 THEN RETURN 11;
    WHEN exp < 4500 THEN RETURN 12;
    WHEN exp < 5200 THEN RETURN 13;
    WHEN exp < 5950 THEN RETURN 14;
    WHEN exp < 6750 THEN RETURN 15;
    WHEN exp < 7600 THEN RETURN 16;
    WHEN exp < 8500 THEN RETURN 17;
    WHEN exp < 9450 THEN RETURN 18;
    WHEN exp < 10450 THEN RETURN 19;
    ELSE RETURN 20;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to get experience needed for next level
CREATE OR REPLACE FUNCTION get_exp_for_next_level(current_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  CASE 
    WHEN current_level = 1 THEN RETURN 100;
    WHEN current_level = 2 THEN RETURN 250;
    WHEN current_level = 3 THEN RETURN 450;
    WHEN current_level = 4 THEN RETURN 700;
    WHEN current_level = 5 THEN RETURN 1000;
    WHEN current_level = 6 THEN RETURN 1350;
    WHEN current_level = 7 THEN RETURN 1750;
    WHEN current_level = 8 THEN RETURN 2200;
    WHEN current_level = 9 THEN RETURN 2700;
    WHEN current_level = 10 THEN RETURN 3250;
    WHEN current_level = 11 THEN RETURN 3850;
    WHEN current_level = 12 THEN RETURN 4500;
    WHEN current_level = 13 THEN RETURN 5200;
    WHEN current_level = 14 THEN RETURN 5950;
    WHEN current_level = 15 THEN RETURN 6750;
    WHEN current_level = 16 THEN RETURN 7600;
    WHEN current_level = 17 THEN RETURN 8500;
    WHEN current_level = 18 THEN RETURN 9450;
    WHEN current_level = 19 THEN RETURN 10450;
    ELSE RETURN 10450; -- Max level
  END CASE;
END;
$$ LANGUAGE plpgsql;
