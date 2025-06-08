/*
  # DevConnect Database Schema

  1. New Tables
    - `profiles` - Extended user profiles with skills and bio
    - `articles` - User-generated articles and content
    - `ideas` - Project ideas and collaboration requests
    - `queries` - Technical questions and solutions
    - `generated_code` - AI-generated code snippets
    - `flowcharts` - Visual flowchart designs
    - `collaborations` - Project collaboration tracking
    - `comments` - Comments on articles, ideas, etc.
    - `votes` - Voting system for ideas and content
    - `tags` - Tagging system for content categorization

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user ownership
*/

-- Create custom types
CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected', 'draft', 'published');
CREATE TYPE query_status AS ENUM ('open', 'answered', 'closed');
CREATE TYPE collaboration_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE sharing_permission AS ENUM ('private', 'public', 'collaborators');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  bio text DEFAULT '',
  skills text[] DEFAULT '{}',
  expertise_level text DEFAULT 'beginner',
  location text DEFAULT '',
  github_username text,
  linkedin_profile text,
  website_url text,
  reputation_score integer DEFAULT 0,
  total_contributions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  status content_status DEFAULT 'draft',
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  reading_time integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  detailed_description text,
  status content_status DEFAULT 'pending',
  category text NOT NULL,
  difficulty_level text DEFAULT 'medium',
  estimated_duration text,
  required_skills text[] DEFAULT '{}',
  votes_count integer DEFAULT 0,
  collaborators_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  is_seeking_collaborators boolean DEFAULT true,
  max_collaborators integer DEFAULT 5,
  project_url text,
  repository_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Queries table
CREATE TABLE IF NOT EXISTS queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  query_text text NOT NULL,
  code_snippet text,
  programming_language text,
  status query_status DEFAULT 'open',
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  priority_level text DEFAULT 'medium',
  views_count integer DEFAULT 0,
  answers_count integer DEFAULT 0,
  votes_count integer DEFAULT 0,
  is_solved boolean DEFAULT false,
  best_answer_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Generated Code table
CREATE TABLE IF NOT EXISTS generated_code (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  code_snippet text NOT NULL,
  programming_language text NOT NULL,
  framework text,
  prompt_used text,
  tags text[] DEFAULT '{}',
  performance_metrics jsonb DEFAULT '{}',
  execution_time real,
  memory_usage real,
  lines_of_code integer DEFAULT 0,
  complexity_score integer DEFAULT 0,
  is_public boolean DEFAULT true,
  downloads_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Flowcharts table
CREATE TABLE IF NOT EXISTS flowcharts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  flowchart_data jsonb NOT NULL,
  thumbnail_url text,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  sharing_permission sharing_permission DEFAULT 'private',
  version_number integer DEFAULT 1,
  is_template boolean DEFAULT false,
  views_count integer DEFAULT 0,
  likes_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_modified timestamptz DEFAULT now()
);

-- Collaborations table
CREATE TABLE IF NOT EXISTS collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  collaborator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'contributor',
  status collaboration_status DEFAULT 'active',
  contribution_description text,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(idea_id, collaborator_id)
);

-- Comments table (polymorphic - can comment on articles, ideas, queries, etc.)
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL, -- 'article', 'idea', 'query', 'code'
  content_id uuid NOT NULL,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  likes_count integer DEFAULT 0,
  is_solution boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Votes table (for ideas, queries, comments, etc.)
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Tags table for better tag management
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Query answers table
CREATE TABLE IF NOT EXISTS query_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid REFERENCES queries(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  answer_text text NOT NULL,
  code_snippet text,
  is_accepted boolean DEFAULT false,
  votes_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Flowchart versions table for version history
CREATE TABLE IF NOT EXISTS flowchart_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flowchart_id uuid REFERENCES flowcharts(id) ON DELETE CASCADE NOT NULL,
  version_number integer NOT NULL,
  flowchart_data jsonb NOT NULL,
  change_description text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_user_id ON articles(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_seeking_collaborators ON ideas(is_seeking_collaborators);

CREATE INDEX IF NOT EXISTS idx_queries_user_id ON queries(user_id);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_category ON queries(category);
CREATE INDEX IF NOT EXISTS idx_queries_created_at ON queries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_tags ON queries USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_generated_code_user_id ON generated_code(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_code_language ON generated_code(programming_language);
CREATE INDEX IF NOT EXISTS idx_generated_code_public ON generated_code(is_public);
CREATE INDEX IF NOT EXISTS idx_generated_code_created_at ON generated_code(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_flowcharts_user_id ON flowcharts(user_id);
CREATE INDEX IF NOT EXISTS idx_flowcharts_sharing ON flowcharts(sharing_permission);
CREATE INDEX IF NOT EXISTS idx_flowcharts_category ON flowcharts(category);
CREATE INDEX IF NOT EXISTS idx_flowcharts_created_at ON flowcharts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_content ON comments(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_votes_content ON votes(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

CREATE INDEX IF NOT EXISTS idx_collaborations_idea_id ON collaborations(idea_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_collaborator_id ON collaborations(collaborator_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowcharts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowchart_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for articles
CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  TO authenticated
  USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Users can manage own articles"
  ON articles FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for ideas
CREATE POLICY "Anyone can view approved ideas"
  ON ideas FOR SELECT
  TO authenticated
  USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Users can manage own ideas"
  ON ideas FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for queries
CREATE POLICY "Anyone can view queries"
  ON queries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own queries"
  ON queries FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for generated_code
CREATE POLICY "Anyone can view public code"
  ON generated_code FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own code"
  ON generated_code FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for flowcharts
CREATE POLICY "Users can view accessible flowcharts"
  ON flowcharts FOR SELECT
  TO authenticated
  USING (
    sharing_permission = 'public' 
    OR user_id = auth.uid()
    OR (sharing_permission = 'collaborators' AND EXISTS (
      SELECT 1 FROM collaborations c 
      JOIN ideas i ON c.idea_id = i.id 
      WHERE c.collaborator_id = auth.uid() AND i.user_id = flowcharts.user_id
    ))
  );

CREATE POLICY "Users can manage own flowcharts"
  ON flowcharts FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for collaborations
CREATE POLICY "Users can view collaborations they're part of"
  ON collaborations FOR SELECT
  TO authenticated
  USING (
    collaborator_id = auth.uid() 
    OR EXISTS (SELECT 1 FROM ideas WHERE id = idea_id AND user_id = auth.uid())
  );

CREATE POLICY "Idea owners can manage collaborations"
  ON collaborations FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM ideas WHERE id = idea_id AND user_id = auth.uid()));

CREATE POLICY "Users can join collaborations"
  ON collaborations FOR INSERT
  TO authenticated
  WITH CHECK (collaborator_id = auth.uid());

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own comments"
  ON comments FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes"
  ON votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own votes"
  ON votes FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for tags
CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for query_answers
CREATE POLICY "Anyone can view query answers"
  ON query_answers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own answers"
  ON query_answers FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for flowchart_versions
CREATE POLICY "Users can view flowchart versions they have access to"
  ON flowchart_versions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM flowcharts f 
    WHERE f.id = flowchart_id 
    AND (f.user_id = auth.uid() OR f.sharing_permission = 'public')
  ));

CREATE POLICY "Users can create versions for own flowcharts"
  ON flowchart_versions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM flowcharts f 
    WHERE f.id = flowchart_id AND f.user_id = auth.uid()
  ));

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_queries_updated_at BEFORE UPDATE ON queries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_code_updated_at BEFORE UPDATE ON generated_code FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_flowcharts_updated_at BEFORE UPDATE ON flowcharts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_query_answers_updated_at BEFORE UPDATE ON query_answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_modified for flowcharts
CREATE OR REPLACE FUNCTION update_flowchart_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flowcharts_last_modified BEFORE UPDATE ON flowcharts FOR EACH ROW EXECUTE FUNCTION update_flowchart_last_modified();

-- Function to increment usage count for tags
CREATE OR REPLACE FUNCTION increment_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tags SET usage_count = usage_count + 1 WHERE name = ANY(NEW.tags);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tag usage counting
CREATE TRIGGER increment_article_tag_usage AFTER INSERT ON articles FOR EACH ROW EXECUTE FUNCTION increment_tag_usage();
CREATE TRIGGER increment_query_tag_usage AFTER INSERT ON queries FOR EACH ROW EXECUTE FUNCTION increment_tag_usage();
CREATE TRIGGER increment_code_tag_usage AFTER INSERT ON generated_code FOR EACH ROW EXECUTE FUNCTION increment_tag_usage();
CREATE TRIGGER increment_flowchart_tag_usage AFTER INSERT ON flowcharts FOR EACH ROW EXECUTE FUNCTION increment_tag_usage();

-- Function to update reputation score
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reputation based on various activities
  IF TG_TABLE_NAME = 'votes' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE profiles SET reputation_score = reputation_score + 1 
      WHERE id = (
        CASE NEW.content_type
          WHEN 'article' THEN (SELECT user_id FROM articles WHERE id = NEW.content_id)
          WHEN 'idea' THEN (SELECT user_id FROM ideas WHERE id = NEW.content_id)
          WHEN 'query' THEN (SELECT user_id FROM queries WHERE id = NEW.content_id)
          WHEN 'code' THEN (SELECT user_id FROM generated_code WHERE id = NEW.content_id)
        END
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reputation_on_vote AFTER INSERT ON votes FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

-- Insert some default tags
INSERT INTO tags (name, description, color) VALUES
  ('JavaScript', 'JavaScript programming language', '#F7DF1E'),
  ('TypeScript', 'TypeScript programming language', '#3178C6'),
  ('React', 'React JavaScript library', '#61DAFB'),
  ('Node.js', 'Node.js runtime environment', '#339933'),
  ('Python', 'Python programming language', '#3776AB'),
  ('Java', 'Java programming language', '#ED8B00'),
  ('C++', 'C++ programming language', '#00599C'),
  ('Go', 'Go programming language', '#00ADD8'),
  ('Rust', 'Rust programming language', '#000000'),
  ('PHP', 'PHP programming language', '#777BB4'),
  ('Frontend', 'Frontend development', '#FF6B6B'),
  ('Backend', 'Backend development', '#4ECDC4'),
  ('Database', 'Database related topics', '#45B7D1'),
  ('DevOps', 'DevOps and deployment', '#96CEB4'),
  ('Mobile', 'Mobile app development', '#FFEAA7'),
  ('Web', 'Web development', '#DDA0DD'),
  ('API', 'API development and integration', '#98D8C8'),
  ('Security', 'Security and authentication', '#F7DC6F'),
  ('Testing', 'Testing and quality assurance', '#BB8FCE'),
  ('Performance', 'Performance optimization', '#85C1E9')
ON CONFLICT (name) DO NOTHING;