-- Log every page load (not just unique visitors)
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  path TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_visits_ip_hash ON visits(ip_hash);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access to visits" ON visits;
CREATE POLICY "No public access to visits"
  ON visits FOR ALL
  USING (false);
