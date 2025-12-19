/*
  # Create Documentation Platform Schema

  ## Overview
  This migration creates the core schema for a documentation platform similar to GitBook.

  ## 1. New Tables
  
  ### `spaces`
  - `id` (uuid, primary key) - Unique identifier for the space
  - `name` (text) - Name of the documentation space
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text, nullable) - Description of the space
  - `owner_id` (uuid) - Reference to the user who owns this space
  - `is_public` (boolean) - Whether the space is publicly accessible
  - `created_at` (timestamptz) - When the space was created
  - `updated_at` (timestamptz) - When the space was last updated

  ### `pages`
  - `id` (uuid, primary key) - Unique identifier for the page
  - `space_id` (uuid) - Reference to the parent space
  - `title` (text) - Title of the page
  - `slug` (text) - URL-friendly identifier within the space
  - `content` (text) - Markdown content of the page
  - `parent_id` (uuid, nullable) - Reference to parent page for hierarchy
  - `order_index` (integer) - Order within parent
  - `is_published` (boolean) - Whether the page is published
  - `created_by` (uuid) - User who created the page
  - `created_at` (timestamptz) - When the page was created
  - `updated_at` (timestamptz) - When the page was last updated

  ## 2. Security
  - Enable RLS on all tables
  - Authenticated users can create their own spaces
  - Space owners can manage their spaces and pages
  - Public spaces are readable by everyone
  - Private spaces are only accessible to owners

  ## 3. Indexes
  - Index on space slug for fast lookups
  - Index on page space_id and slug for fast page retrieval
  - Index on parent_id for hierarchy queries
*/

-- Create spaces table
CREATE TABLE IF NOT EXISTS spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  content text DEFAULT '',
  parent_id uuid REFERENCES pages(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(space_id, slug)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_spaces_slug ON spaces(slug);
CREATE INDEX IF NOT EXISTS idx_spaces_owner ON spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_pages_space ON pages(space_id);
CREATE INDEX IF NOT EXISTS idx_pages_parent ON pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(space_id, slug);

-- Enable Row Level Security
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Spaces policies
CREATE POLICY "Users can view public spaces"
  ON spaces FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can view own spaces"
  ON spaces FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create spaces"
  ON spaces FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own spaces"
  ON spaces FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete own spaces"
  ON spaces FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Pages policies
CREATE POLICY "Users can view published pages in public spaces"
  ON pages FOR SELECT
  TO authenticated
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = pages.space_id
      AND spaces.is_public = true
    )
  );

CREATE POLICY "Users can view all pages in own spaces"
  ON pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = pages.space_id
      AND spaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pages in own spaces"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = pages.space_id
      AND spaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update pages in own spaces"
  ON pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = pages.space_id
      AND spaces.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = pages.space_id
      AND spaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete pages in own spaces"
  ON pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      WHERE spaces.id = pages.space_id
      AND spaces.owner_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_spaces_updated_at
  BEFORE UPDATE ON spaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
