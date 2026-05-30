CREATE TABLE IF NOT EXISTS news_articles (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(64) UNIQUE NOT NULL,
  slug VARCHAR(220) NOT NULL,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  body TEXT,
  tag VARCHAR(160),
  roofline VARCHAR(160),
  image_url TEXT,
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS news_articles_published_idx ON news_articles (published_at DESC NULLS LAST);
