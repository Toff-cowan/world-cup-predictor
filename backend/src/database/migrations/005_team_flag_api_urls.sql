-- Point flag_url at our API route (filled on scrape; safe to re-run)
UPDATE teams
SET flag_url = '/api/flags/' || UPPER(country_code)
WHERE country_code IS NOT NULL
  AND (
    flag_url IS NULL
    OR flag_url NOT LIKE '/api/flags/%'
  );
