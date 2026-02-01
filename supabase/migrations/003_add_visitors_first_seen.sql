-- Store when each visitor was first seen so we can answer "visitors since [date]"
ALTER TABLE visitors
  ADD COLUMN IF NOT EXISTS first_seen TIMESTAMPTZ DEFAULT NOW();

-- Backfill existing rows: use last_seen as first_seen where null
UPDATE visitors
SET first_seen = COALESCE(first_seen, last_seen)
WHERE first_seen IS NULL;
