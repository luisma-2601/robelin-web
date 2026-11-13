-- Run this in Supabase SQL Editor to create the offers table

CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'Nuevo',
  color TEXT NOT NULL DEFAULT 'purple',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Everyone can read active offers
CREATE POLICY "Anyone can view active offers"
  ON offers FOR SELECT
  USING (active = true);

-- Admins can do everything (via service role or authenticated admin)
CREATE POLICY "Admins can manage offers"
  ON offers FOR ALL
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
