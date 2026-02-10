-- Core phrases table (mirrors JSON structure)
CREATE TABLE IF NOT EXISTS phrases (
  phrase_numbers INTEGER PRIMARY KEY,
  hawaiian_phrase TEXT NOT NULL,
  english_phrase TEXT,
  meaning_phrase TEXT,
  headword_link TEXT,
  source_link TEXT,
  hawaiian_letter TEXT,
  headword_label TEXT,
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}'
);

-- Indexes for search and filtering
CREATE INDEX IF NOT EXISTS idx_phrases_hawaiian_letter ON phrases(hawaiian_letter);
CREATE INDEX IF NOT EXISTS idx_phrases_category ON phrases(category);
CREATE INDEX IF NOT EXISTS idx_phrases_tags ON phrases USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_phrases_hawaiian_phrase ON phrases USING GIN(to_tsvector('english', hawaiian_phrase));
CREATE INDEX IF NOT EXISTS idx_phrases_english_phrase ON phrases USING GIN(to_tsvector('english', english_phrase));
CREATE INDEX IF NOT EXISTS idx_phrases_meaning_phrase ON phrases USING GIN(to_tsvector('english', meaning_phrase));

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phrase_numbers INTEGER NOT NULL REFERENCES phrases(phrase_numbers) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, phrase_numbers)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);

-- Visitors table (privacy-aware)
CREATE TABLE IF NOT EXISTS visitors (
  ip_hash TEXT PRIMARY KEY,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hawaiian_phrase TEXT NOT NULL,
  english_phrase TEXT,
  meaning_phrase TEXT,
  submitted_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Whiteboards table
CREATE TABLE IF NOT EXISTS whiteboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whiteboards_user_id ON whiteboards(user_id);

-- Whiteboard notes table
CREATE TABLE IF NOT EXISTS whiteboard_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id UUID NOT NULL REFERENCES whiteboards(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  phrase_numbers INTEGER REFERENCES phrases(phrase_numbers) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whiteboard_notes_whiteboard_id ON whiteboard_notes(whiteboard_id);

-- Enable Row Level Security
ALTER TABLE phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (DROP IF EXISTS so migration is idempotent on re-run)

-- Phrases: publicly readable
DROP POLICY IF EXISTS "Phrases are publicly readable" ON phrases;
CREATE POLICY "Phrases are publicly readable"
  ON phrases FOR SELECT
  USING (true);

-- Favorites: users can only see their own
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Visitors: server-only writes (no public access)
DROP POLICY IF EXISTS "No public access to visitors" ON visitors;
CREATE POLICY "No public access to visitors"
  ON visitors FOR ALL
  USING (false);

-- Submissions: anyone can insert, but only view their own (or admin)
DROP POLICY IF EXISTS "Anyone can submit" ON submissions;
CREATE POLICY "Anyone can submit"
  ON submissions FOR INSERT
  WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
CREATE POLICY "Users can view their own submissions"
  ON submissions FOR SELECT
  USING (submitted_by = auth.email() OR auth.uid() IS NOT NULL);

-- Whiteboards: users can only see their own
DROP POLICY IF EXISTS "Users can manage their own whiteboards" ON whiteboards;
CREATE POLICY "Users can manage their own whiteboards"
  ON whiteboards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Whiteboard notes: users can only see notes from their whiteboards
DROP POLICY IF EXISTS "Users can manage notes from their whiteboards" ON whiteboard_notes;
CREATE POLICY "Users can manage notes from their whiteboards"
  ON whiteboard_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM whiteboards
      WHERE whiteboards.id = whiteboard_notes.whiteboard_id
      AND whiteboards.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM whiteboards
      WHERE whiteboards.id = whiteboard_notes.whiteboard_id
      AND whiteboards.user_id = auth.uid()
    )
  );
