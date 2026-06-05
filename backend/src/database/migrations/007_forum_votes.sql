ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS dislikes INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS forum_post_votes (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_forum_post_votes_post ON forum_post_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_post_votes_user ON forum_post_votes(user_id);
