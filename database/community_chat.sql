-- Community Chat System
-- Create messages table for community chat

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Policy: Users can only insert their own messages (and must be level 3+)
CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND level >= 3
    )
  );

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

-- Function to get bad words found in message
CREATE OR REPLACE FUNCTION get_bad_words_in_message(message_text TEXT)
RETURNS TEXT[] AS $$
DECLARE
  bad_words_found TEXT[];
BEGIN
  SELECT ARRAY_AGG(word)
  INTO bad_words_found
  FROM bad_words
  WHERE LOWER(message_text) LIKE '%' || LOWER(word) || '%';
  
  RETURN COALESCE(bad_words_found, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;
