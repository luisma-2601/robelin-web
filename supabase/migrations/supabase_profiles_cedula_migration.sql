-- Añade cédula y contador de compras a profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cedula text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS purchase_count integer NOT NULL DEFAULT 0;
