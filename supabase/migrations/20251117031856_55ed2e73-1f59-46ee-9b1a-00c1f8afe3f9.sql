-- Add Daily.co room URL to livestream_sessions
ALTER TABLE livestream_sessions 
ADD COLUMN IF NOT EXISTS daily_room_url text,
ADD COLUMN IF NOT EXISTS daily_room_name text;

-- Update livestream_sessions to make Agora tokens nullable since we're using Daily.co now
ALTER TABLE livestream_sessions 
ALTER COLUMN explorer_token DROP NOT NULL,
ALTER COLUMN guide_token DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN livestream_sessions.daily_room_url IS 'Daily.co room URL for the livestream session';
COMMENT ON COLUMN livestream_sessions.daily_room_name IS 'Daily.co room name for the livestream session';