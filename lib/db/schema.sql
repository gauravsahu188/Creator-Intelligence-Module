-- Instagram Scraper Database Schema
-- Database: instagram_scrapper_data
-- PostgreSQL 18

CREATE TABLE IF NOT EXISTS profiles (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255) UNIQUE NOT NULL,
  full_name     TEXT,
  bio           TEXT,
  followers     INTEGER,
  is_private    BOOLEAN,
  profile_pic_url TEXT,
  scraped_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Index for sorting by scraped date
CREATE INDEX IF NOT EXISTS idx_profiles_scraped_at ON profiles(scraped_at DESC);

-- Index for followers count ordering
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON profiles(followers DESC);

-- Function to update `updated_at` on upsert
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
