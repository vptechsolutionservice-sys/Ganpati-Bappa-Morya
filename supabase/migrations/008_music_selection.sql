-- Add music_url column to invitations table
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS music_url TEXT;
