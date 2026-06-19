-- Instagram Scraper Database Schema
-- Database: instagram_scrapper_data
-- PostgreSQL 18

CREATE TABLE IF NOT EXISTS jobs (
  id               SERIAL PRIMARY KEY,
  username         VARCHAR(255) NOT NULL,
  status           VARCHAR(50) DEFAULT 'Scraping', -- 'Scraping', 'Processing_ML', 'Completed', 'Failed'
  apify_run_id     VARCHAR(255),
  total_chunks     INTEGER DEFAULT 0,
  processed_chunks INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
  id               SERIAL PRIMARY KEY,
  username         VARCHAR(255) UNIQUE NOT NULL,
  full_name        TEXT,
  bio              TEXT,
  followers        INTEGER,
  following_count  INTEGER,
  post_count       INTEGER,
  is_verified      BOOLEAN DEFAULT false,
  is_private       BOOLEAN,
  profile_pic_url  TEXT,
  external_url     TEXT,
  female_pct       NUMERIC(5,2),
  male_pct         NUMERIC(5,2),
  undisclosed_pct  NUMERIC(5,2),
  interest_cohort  VARCHAR(100),
  scraped_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id                SERIAL PRIMARY KEY,
  profile_id        INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
  shortcode         VARCHAR(100) UNIQUE NOT NULL,
  caption           TEXT,
  likes_count       INTEGER DEFAULT 0,
  comments_count    INTEGER DEFAULT 0,
  media_type        VARCHAR(50),
  thumbnail_url     TEXT,
  timestamp         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id                SERIAL PRIMARY KEY,
  post_id           INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  username          VARCHAR(255),
  raw_text          TEXT NOT NULL,
  authenticity      VARCHAR(50),
  bot_likelihood    VARCHAR(50),
  political_stance  VARCHAR(50),
  political_party   VARCHAR(100),
  relevance         VARCHAR(50),
  comment_type      VARCHAR(50),
  language          VARCHAR(50),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);

-- Function to update `updated_at` on upsert
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_jobs ON jobs;
CREATE TRIGGER set_updated_at_jobs
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
