/*
  # Add Communities Feature

  1. New Tables
    - `communities`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `bio` (text)
      - `description` (text)
      - `cover_image` (text)
      - `creator_id` (uuid, references profiles)
      - `member_count` (integer, default 0)
      - `is_public` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `community_members`
      - `id` (uuid, primary key)
      - `community_id` (uuid, references communities)
      - `user_id` (uuid, references profiles)
      - `role` (text, default 'member')
      - `joined_at` (timestamp)
      - Unique constraint on (community_id, user_id)

  2. Security
    - Enable RLS on both tables
    - Add policies for community access and member management
    - Communities are public by default but can be made private

  3. Functions
    - Trigger to update member_count when members are added/removed
*/

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  bio text DEFAULT '',
  description text DEFAULT '',
  cover_image text,
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  member_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community members table
CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_communities_creator_id ON communities(creator_id);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communities_is_public ON communities(is_public);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);

-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communities
CREATE POLICY "Anyone can view public communities"
  ON communities FOR SELECT
  TO authenticated
  USING (is_public = true OR creator_id = auth.uid() OR EXISTS (
    SELECT 1 FROM community_members 
    WHERE community_id = communities.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create communities"
  ON communities FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Community creators can update their communities"
  ON communities FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Community creators can delete their communities"
  ON communities FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- RLS Policies for community_members
CREATE POLICY "Users can view community members"
  ON community_members FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_id 
    AND (c.is_public = true OR c.creator_id = auth.uid() OR user_id = auth.uid())
  ));

CREATE POLICY "Users can join communities"
  ON community_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave communities or creators can manage members"
  ON community_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM communities WHERE id = community_id AND creator_id = auth.uid())
  );

-- Function to update member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET member_count = member_count - 1 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for member count updates
CREATE TRIGGER update_community_member_count_trigger
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Create trigger for updated_at
CREATE TRIGGER update_communities_updated_at 
  BEFORE UPDATE ON communities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatically add creator as admin member when community is created
CREATE OR REPLACE FUNCTION add_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'admin');
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER add_creator_as_admin_trigger
  AFTER INSERT ON communities
  FOR EACH ROW EXECUTE FUNCTION add_creator_as_admin();