ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS share_token VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_forum_posts_share_token ON forum_posts(share_token);
