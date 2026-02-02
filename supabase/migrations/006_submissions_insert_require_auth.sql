-- Require authenticated users for submissions INSERT instead of unrestricted (WITH CHECK true).
-- Only users with a valid session can insert rows.

DROP POLICY IF EXISTS "Anyone can submit" ON submissions;
CREATE POLICY "Authenticated users can submit"
  ON submissions FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);
