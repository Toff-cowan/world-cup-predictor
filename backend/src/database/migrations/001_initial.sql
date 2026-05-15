-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(80) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams (48 teams, groups A–L)
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(8),
  group_letter CHAR(1),
  fifa_rank INT,
  flag_url TEXT,
  fifa_team_id VARCHAR(32),
  country_code VARCHAR(8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE teams ADD CONSTRAINT teams_country_code_key UNIQUE (country_code);

-- Matches (group + knockout)
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(64) UNIQUE,
  home_team_id INT REFERENCES teams(id) ON DELETE SET NULL,
  away_team_id INT REFERENCES teams(id) ON DELETE SET NULL,
  stage VARCHAR(40) NOT NULL DEFAULT 'group',
  group_letter CHAR(1),
  kickoff_at TIMESTAMPTZ,
  home_score INT,
  away_score INT,
  status VARCHAR(20) DEFAULT 'scheduled',
  venue VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Standings (scraped / recalculated)
CREATE TABLE IF NOT EXISTS standings (
  id SERIAL PRIMARY KEY,
  team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  group_letter CHAR(1) NOT NULL,
  played INT DEFAULT 0,
  won INT DEFAULT 0,
  drawn INT DEFAULT 0,
  lost INT DEFAULT 0,
  goals_for INT DEFAULT 0,
  goals_against INT DEFAULT 0,
  goal_difference INT DEFAULT 0,
  points INT DEFAULT 0,
  position INT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, group_letter)
);

-- Predictions (JSON bracket + locked stages)
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL DEFAULT 'My Bracket',
  slug VARCHAR(160),
  bracket JSONB NOT NULL DEFAULT '{}',
  locked_stages TEXT[] DEFAULT '{}',
  is_fully_locked BOOLEAN DEFAULT FALSE,
  accuracy_score NUMERIC(6, 3),
  share_token VARCHAR(64) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Forum posts
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_comments (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scrape cache metadata
CREATE TABLE IF NOT EXISTS scrape_cache (
  id SERIAL PRIMARY KEY,
  source VARCHAR(80) NOT NULL,
  payload JSONB NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_predictions_user ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_standings_group ON standings(group_letter);
CREATE INDEX IF NOT EXISTS idx_matches_stage ON matches(stage);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
