-- Community Chat System
-- Create messages table for community chat

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  profile_picture TEXT,
  message TEXT NOT NULL,
  twitter_link TEXT, -- Only Twitter links allowed
  is_moderated BOOLEAN DEFAULT FALSE,
  moderation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_moderated ON chat_messages(is_moderated);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all messages
CREATE POLICY "Users can read all chat messages" ON chat_messages
  FOR SELECT USING (true);

-- Policy: Users can only insert their own messages
CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own messages (within 5 minutes)
CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (
    auth.uid() = user_id AND
    created_at > NOW() - INTERVAL '5 minutes'
  );

-- Policy: Users can delete their own messages (within 5 minutes)
CREATE POLICY "Users can delete their own messages" ON chat_messages
  FOR DELETE USING (
    auth.uid() = user_id AND
    created_at > NOW() - INTERVAL '5 minutes'
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Bad words filter table
CREATE TABLE IF NOT EXISTS bad_words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT UNIQUE NOT NULL,
  severity TEXT DEFAULT 'medium', -- low, medium, high
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common bad words
INSERT INTO bad_words (word, severity) VALUES
  ('fuck', 'high'),
  ('bitch', 'high'),
  ('shit', 'medium'),
  ('damn', 'low'),
  ('ass', 'medium'),
  ('asshole', 'high'),
  ('bastard', 'medium'),
  ('crap', 'low'),
  ('hell', 'low'),
  ('idiot', 'medium'),
  ('stupid', 'low'),
  ('dumb', 'low'),
  ('hate', 'medium'),
  ('kill', 'high'),
  ('die', 'high'),
  ('suck', 'medium'),
  ('sucks', 'medium'),
  ('loser', 'medium'),
  ('pathetic', 'medium'),
  ('worthless', 'high')
ON CONFLICT (word) DO NOTHING;

-- Function to check if message contains bad words
CREATE OR REPLACE FUNCTION contains_bad_words(message_text TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  bad_word_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO bad_word_count
  FROM bad_words
  WHERE LOWER(message_text) LIKE '%' || LOWER(word) || '%';
  
  RETURN bad_word_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Mod Bot Questions table
CREATE TABLE IF NOT EXISTS mod_bot_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  points_reward INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Billions-related questions
INSERT INTO mod_bot_questions (question, correct_answer, points_reward) VALUES
  ('What is the name of the main character in Billions?', 'Bobby Axelrod', 50),
  ('Which hedge fund does Bobby Axelrod run?', 'Axe Capital', 50),
  ('Who is the US Attorney trying to prosecute Bobby?', 'Chuck Rhoades', 50),
  ('What is the name of Bobby''s wife?', 'Lara Axelrod', 50),
  ('Which character is known as "Dollar Bill"?', 'Bill Stearn', 50),
  ('What is the name of Chuck''s father?', 'Charles Rhoades Sr.', 50),
  ('Which character is Bobby''s chief investment officer?', 'Wags', 50),
  ('What is the name of the rival hedge fund?', 'Taylor Mason Capital', 50),
  ('Which character becomes a rival to Bobby?', 'Taylor Mason', 50),
  ('What is Chuck''s wife''s profession?', 'Psychiatrist', 50)
ON CONFLICT DO NOTHING;

-- Mod Bot Sessions table to track when questions were asked
CREATE TABLE IF NOT EXISTS mod_bot_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES mod_bot_questions(id),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  points_reward INTEGER NOT NULL,
  winner_user_id UUID REFERENCES profiles(id),
  winner_username TEXT,
  is_answered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE
);

-- Function to get a random question that hasn't been asked recently
CREATE OR REPLACE FUNCTION get_random_mod_question()
RETURNS TABLE(
  question_id UUID,
  question_text TEXT,
  correct_answer TEXT,
  points_reward INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mbq.id,
    mbq.question,
    mbq.correct_answer,
    mbq.points_reward
  FROM mod_bot_questions mbq
  WHERE mbq.is_active = TRUE
    AND mbq.id NOT IN (
      SELECT question_id 
      FROM mod_bot_sessions 
      WHERE created_at > NOW() - INTERVAL '24 hours'
    )
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;
