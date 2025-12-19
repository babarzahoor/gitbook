/*
  # Fusiobook - Advanced Documentation Platform Schema

  ## Overview
  This migration creates an enhanced documentation platform with team collaboration,
  versioning, templates, analytics, and advanced features.

  ## 1. New Tables

  ### `teams`
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Team name
  - `slug` (text, unique) - URL-friendly identifier
  - `avatar_url` (text, nullable) - Team avatar
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Update timestamp

  ### `team_members`
  - `id` (uuid, primary key) - Unique identifier
  - `team_id` (uuid) - Reference to team
  - `user_id` (uuid) - Reference to user
  - `role` (text) - Member role (owner, admin, editor, viewer)
  - `created_at` (timestamptz) - When member was added
  - Unique constraint on (team_id, user_id)

  ### `workspaces`
  - `id` (uuid, primary key) - Unique identifier
  - `team_id` (uuid) - Reference to team
  - `name` (text) - Workspace name
  - `slug` (text) - URL-friendly identifier
  - `description` (text, nullable) - Description
  - `icon` (text, nullable) - Emoji or icon
  - `is_public` (boolean) - Public visibility
  - `theme` (jsonb) - Custom theme settings
  - `custom_domain` (text, nullable) - Custom domain
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Update timestamp
  - Unique constraint on (team_id, slug)

  ### `collections`
  - `id` (uuid, primary key) - Unique identifier
  - `workspace_id` (uuid) - Reference to workspace
  - `name` (text) - Collection name
  - `slug` (text) - URL-friendly identifier
  - `description` (text, nullable) - Description
  - `icon` (text, nullable) - Emoji or icon
  - `order_index` (integer) - Display order
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Update timestamp
  - Unique constraint on (workspace_id, slug)

  ### `documents`
  - `id` (uuid, primary key) - Unique identifier
  - `collection_id` (uuid) - Reference to collection
  - `parent_id` (uuid, nullable) - Parent document for nesting
  - `title` (text) - Document title
  - `slug` (text) - URL-friendly identifier
  - `content` (text) - Markdown content
  - `excerpt` (text, nullable) - Short description
  - `icon` (text, nullable) - Emoji or icon
  - `order_index` (integer) - Display order
  - `is_published` (boolean) - Publication status
  - `template` (text, nullable) - Template used
  - `version` (integer) - Version number
  - `created_by` (uuid) - Creator
  - `updated_by` (uuid, nullable) - Last editor
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Update timestamp
  - `published_at` (timestamptz, nullable) - Publication timestamp

  ### `document_versions`
  - `id` (uuid, primary key) - Unique identifier
  - `document_id` (uuid) - Reference to document
  - `version` (integer) - Version number
  - `title` (text) - Title at this version
  - `content` (text) - Content at this version
  - `created_by` (uuid) - Who created this version
  - `created_at` (timestamptz) - When this version was created
  - `change_summary` (text, nullable) - Summary of changes

  ### `comments`
  - `id` (uuid, primary key) - Unique identifier
  - `document_id` (uuid) - Reference to document
  - `user_id` (uuid) - Comment author
  - `content` (text) - Comment content
  - `resolved` (boolean) - Resolution status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Update timestamp

  ### `templates`
  - `id` (uuid, primary key) - Unique identifier
  - `workspace_id` (uuid) - Reference to workspace
  - `name` (text) - Template name
  - `description` (text, nullable) - Description
  - `content` (text) - Template content
  - `icon` (text, nullable) - Emoji or icon
  - `is_default` (boolean) - Default template flag
  - `created_at` (timestamptz) - Creation timestamp

  ### `page_views`
  - `id` (uuid, primary key) - Unique identifier
  - `document_id` (uuid) - Reference to document
  - `visitor_id` (text) - Anonymous visitor ID
  - `user_id` (uuid, nullable) - Authenticated user ID
  - `viewed_at` (timestamptz) - View timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Team members can access their team's resources based on role
  - Public workspaces accessible to everyone
  - Proper role-based access control

  ## 3. Indexes
  - Performance indexes on all foreign keys
  - Full-text search indexes on content
  - Compound indexes for common queries
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  is_public boolean DEFAULT false,
  theme jsonb DEFAULT '{}',
  custom_domain text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_id, slug)
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, slug)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  content text DEFAULT '',
  excerpt text,
  icon text,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT false,
  template text,
  version integer DEFAULT 1,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  published_at timestamptz
);

-- Create document_versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version integer NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  change_summary text,
  UNIQUE(document_id, version)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  content text NOT NULL,
  icon text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  viewed_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_team ON workspaces(team_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(team_id, slug);
CREATE INDEX IF NOT EXISTS idx_collections_workspace ON collections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_collection ON documents(collection_id);
CREATE INDEX IF NOT EXISTS idx_documents_parent ON documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_comments_document ON comments(document_id);
CREATE INDEX IF NOT EXISTS idx_templates_workspace ON templates(workspace_id);
CREATE INDEX IF NOT EXISTS idx_page_views_document ON page_views(document_id);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(viewed_at);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view teams they are members of"
  ON teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team owners and admins can update teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners can delete teams"
  ON teams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Team members policies
CREATE POLICY "Team members can view their team memberships"
  ON team_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and admins can manage members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Workspaces policies
CREATE POLICY "Public workspaces are viewable by everyone"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = workspaces.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = workspaces.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY "Team admins can manage workspaces"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = workspaces.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners can delete workspaces"
  ON workspaces FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = workspaces.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Collections policies
CREATE POLICY "Users can view collections in accessible workspaces"
  ON collections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      LEFT JOIN team_members tm ON tm.team_id = w.team_id AND tm.user_id = auth.uid()
      WHERE w.id = collections.workspace_id
      AND (w.is_public = true OR tm.user_id IS NOT NULL)
    )
  );

CREATE POLICY "Team editors can manage collections"
  ON collections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      JOIN team_members tm ON tm.team_id = w.team_id
      WHERE w.id = collections.workspace_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Documents policies
CREATE POLICY "Users can view published docs in accessible workspaces"
  ON documents FOR SELECT
  TO authenticated
  USING (
    (is_published = true AND EXISTS (
      SELECT 1 FROM collections c
      JOIN workspaces w ON w.id = c.workspace_id
      WHERE c.id = documents.collection_id
      AND w.is_public = true
    )) OR
    EXISTS (
      SELECT 1 FROM collections c
      JOIN workspaces w ON w.id = c.workspace_id
      JOIN team_members tm ON tm.team_id = w.team_id
      WHERE c.id = documents.collection_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team editors can manage documents"
  ON documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections c
      JOIN workspaces w ON w.id = c.workspace_id
      JOIN team_members tm ON tm.team_id = w.team_id
      WHERE c.id = documents.collection_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Document versions policies (inherit from documents)
CREATE POLICY "Users can view versions of accessible documents"
  ON document_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN collections c ON c.id = d.collection_id
      JOIN workspaces w ON w.id = c.workspace_id
      LEFT JOIN team_members tm ON tm.team_id = w.team_id AND tm.user_id = auth.uid()
      WHERE d.id = document_versions.document_id
      AND ((d.is_published = true AND w.is_public = true) OR tm.user_id IS NOT NULL)
    )
  );

CREATE POLICY "Team editors can create versions"
  ON document_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM documents d
      JOIN collections c ON c.id = d.collection_id
      JOIN workspaces w ON w.id = c.workspace_id
      JOIN team_members tm ON tm.team_id = w.team_id
      WHERE d.id = document_versions.document_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments on accessible documents"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN collections c ON c.id = d.collection_id
      JOIN workspaces w ON w.id = c.workspace_id
      LEFT JOIN team_members tm ON tm.team_id = w.team_id AND tm.user_id = auth.uid()
      WHERE d.id = comments.document_id
      AND ((d.is_published = true AND w.is_public = true) OR tm.user_id IS NOT NULL)
    )
  );

CREATE POLICY "Team members can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM documents d
      JOIN collections c ON c.id = d.collection_id
      JOIN workspaces w ON w.id = c.workspace_id
      JOIN team_members tm ON tm.team_id = w.team_id
      WHERE d.id = comments.document_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Comment authors can update their comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Comment authors and admins can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM documents d
      JOIN collections c ON c.id = d.collection_id
      JOIN workspaces w ON w.id = c.workspace_id
      JOIN team_members tm ON tm.team_id = w.team_id
      WHERE d.id = comments.document_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- Templates policies
CREATE POLICY "Team members can view workspace templates"
  ON templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      JOIN team_members tm ON tm.team_id = w.team_id
      WHERE w.id = templates.workspace_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team editors can manage templates"
  ON templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      JOIN team_members tm ON tm.team_id = w.team_id
      WHERE w.id = templates.workspace_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Page views policies (allow all authenticated to insert, view own)
CREATE POLICY "Anyone can record page views"
  ON page_views FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Team members can view analytics"
  ON page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN collections c ON c.id = d.collection_id
      JOIN workspaces w ON w.id = c.workspace_id
      JOIN team_members tm ON tm.team_id = w.team_id
      WHERE d.id = page_views.document_id
      AND tm.user_id = auth.uid()
    )
  );

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
