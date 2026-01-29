# Hawaiian Language Handling

## Diacritics and ʻOkina

The Hawaiian language uses the ʻokina (ʻ) and kahakō (macron) diacritics. This app handles these correctly.

### ʻOkina Normalization

Various apostrophe-like characters are normalized to the canonical ʻokina (U+02BB):
- `'` (straight apostrophe)
- `'` (right single quotation mark)
- `ʼ` (modifier letter apostrophe)

All are normalized to `ʻ` (U+02BB) for consistent storage and search.

### Validation

Hawaiian words are validated using the regex: `/^[a-zA-Zʻʼ'\- ]+$/`

This allows:
- All English letters (a-z, A-Z)
- ʻOkina variations
- Hyphens
- Spaces

### Hawaiian Alphabet

The valid Hawaiian alphabet letters are:
```
a, e, i, o, u, h, k, l, m, n, p, w, ʻ
```

### Search Normalization

When searching, text is normalized to:
1. Lowercase
2. Trimmed
3. ʻOkina normalized

This ensures that searches work regardless of how users type the ʻokina.

## Utilities

See `lib/hawaiian/diacritics.ts` and `lib/hawaiian/validation.ts` for implementation details.
