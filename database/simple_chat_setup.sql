-- Simple Community Chat Setup
-- This script creates the chat_messages table with proper permissions

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  profile_picture TEXT,
  message TEXT NOT NULL,
  twitter_link TEXT,
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON chat_messages;

-- Create new policies
CREATE POLICY "Users can read all chat messages" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (
    auth.uid() = user_id AND
    created_at > NOW() - INTERVAL '5 minutes'
  );

CREATE POLICY "Users can delete their own messages" ON chat_messages
  FOR DELETE USING (
    auth.uid() = user_id AND
    created_at > NOW() - INTERVAL '5 minutes'
  );

-- Grant necessary permissions
GRANT ALL ON chat_messages TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Insert a test message to verify the table works
INSERT INTO chat_messages (user_id, username, message) 
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'System',
  'Welcome to the Billions Community Chat! 🎉'
) ON CONFLICT DO NOTHING;
