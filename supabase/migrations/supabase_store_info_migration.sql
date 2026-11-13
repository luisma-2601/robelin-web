-- Run this in Supabase SQL Editor to create the store_info table

CREATE TABLE IF NOT EXISTS store_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  about_title TEXT NOT NULL DEFAULT 'Sobre Nosotros',
  about_description TEXT NOT NULL DEFAULT '',
  mission TEXT NOT NULL DEFAULT '',
  vision TEXT NOT NULL DEFAULT '',
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE store_info ENABLE ROW LEVEL SECURITY;

-- Everyone can read store info
CREATE POLICY "Anyone can view store info"
  ON store_info FOR SELECT
  USING (true);

-- Admins can manage store info
CREATE POLICY "Admins can manage store info"
  ON store_info FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
