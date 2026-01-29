-- Remove category column from phrases table
-- Categories are now derived from tags via tag-category-map.json

-- Drop the index on category first
DROP INDEX IF EXISTS idx_phrases_category;

-- Remove the category column
ALTER TABLE phrases DROP COLUMN IF EXISTS category;
