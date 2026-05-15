ALTER TABLE teams ADD COLUMN IF NOT EXISTS fifa_team_id VARCHAR(32);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS country_code VARCHAR(8);

-- Unique constraint added in 003_teams_country_code_unique.sql
