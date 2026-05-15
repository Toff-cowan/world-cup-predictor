-- Required for ON CONFLICT (country_code) in the FIFA scraper
ALTER TABLE teams ADD COLUMN IF NOT EXISTS fifa_team_id VARCHAR(32);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS country_code VARCHAR(8);

DROP INDEX IF EXISTS teams_country_code_unique;

UPDATE teams SET country_code = UPPER(code)
WHERE country_code IS NULL AND code IS NOT NULL;

DELETE FROM teams t
USING teams t2
WHERE t.id > t2.id
  AND t.country_code IS NOT NULL
  AND t.country_code = t2.country_code;

ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_country_code_key;
ALTER TABLE teams ADD CONSTRAINT teams_country_code_key UNIQUE (country_code);
