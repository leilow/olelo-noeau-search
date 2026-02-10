'use client';

import { useState } from 'react';

export default function SubmitPoeticalPhraseForm() {
  const [formData, setFormData] = useState({
    hawaiian_or_pidgin_phrase: '',
    english_meaning: '',
    kaona_deeper_meaning: '',
    email: '',
    can_share_publicly: false,
    website: '', // honeypot – leave empty; bots often fill it
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hawaiian_or_pidgin_phrase: formData.hawaiian_or_pidgin_phrase,
          english_meaning: formData.english_meaning,
          kaona_deeper_meaning: formData.kaona_deeper_meaning,
          email: formData.email,
          can_share_publicly: formData.can_share_publicly,
          website: formData.website,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Thank you! Your submission has been received and will be reviewed.' });
        setFormData({
          hawaiian_or_pidgin_phrase: '',
          english_meaning: '',
          kaona_deeper_meaning: '',
          email: '',
          can_share_publicly: false,
          website: '',
        });
      } else {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        const msg = data?.error || `There was an error submitting your phrase (${response.status}). Please try again.`;
        setMessage({ type: 'error', text: msg });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'There was an error submitting your phrase. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="p-8 rounded-lg shadow-sm border border-text/10" style={{ backgroundColor: '#FBF4E6' }}>
      <h2 className="text-2xl font-heading font-bold mb-6" style={{ color: '#2c2416' }}>Submit a Poetical Phrase</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot – hidden from users; bots that fill it get rejected */}
        <div className="absolute -left-[9999px] w-1 h-1 overflow-hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="hawaiian_or_pidgin_phrase" className="block font-body mb-2 text-sm font-medium" style={{ color: '#3d3424' }}>
            Hawaiian or Pidgin Phrase *
          </label>
          <input
            type="text"
            id="hawaiian_or_pidgin_phrase"
            required
            value={formData.hawaiian_or_pidgin_phrase}
            onChange={(e) => setFormData({ ...formData, hawaiian_or_pidgin_phrase: e.target.value })}
            onFocus={() => setFocusedField('hawaiian_or_pidgin_phrase')}
            onBlur={() => setFocusedField(null)}
            onMouseEnter={() => setHoveredField('hawaiian_or_pidgin_phrase')}
            onMouseLeave={() => setHoveredField(null)}
            className={`w-full px-4 py-3 border-2 rounded-none text-text font-body focus:outline-none transition-colors ${
              focusedField === 'hawaiian_or_pidgin_phrase' || formData.hawaiian_or_pidgin_phrase.trim().length > 0
                ? 'bg-highlight border-highlight'
                : hoveredField === 'hawaiian_or_pidgin_phrase'
                ? 'bg-button border-highlight'
                : 'border-text/20'
            }`}
            style={{
              backgroundColor:
                focusedField === 'hawaiian_or_pidgin_phrase' || formData.hawaiian_or_pidgin_phrase.trim().length > 0
                  ? undefined
                  : hoveredField === 'hawaiian_or_pidgin_phrase'
                  ? undefined
                  : '#FBF4E6',
              color: '#2c2416',
            }}
          />
        </div>
        <div>
          <label htmlFor="english_meaning" className="block font-body mb-2 text-sm font-medium" style={{ color: '#3d3424' }}>
            English Meaning *
          </label>
          <textarea
            id="english_meaning"
            required
            value={formData.english_meaning}
            onChange={(e) => setFormData({ ...formData, english_meaning: e.target.value })}
            onFocus={() => setFocusedField('english_meaning')}
            onBlur={() => setFocusedField(null)}
            onMouseEnter={() => setHoveredField('english_meaning')}
            onMouseLeave={() => setHoveredField(null)}
            rows={3}
            className={`w-full px-4 py-3 border-2 rounded-lg text-text font-body focus:outline-none transition-colors resize-none ${
              focusedField === 'english_meaning' || formData.english_meaning.trim().length > 0
                ? 'bg-highlight border-highlight'
                : hoveredField === 'english_meaning'
                ? 'bg-button border-highlight'
                : 'border-text/20'
            }`}
            style={{
              backgroundColor:
                focusedField === 'english_meaning' || formData.english_meaning.trim().length > 0
                  ? undefined
                  : hoveredField === 'english_meaning'
                  ? undefined
                  : '#FBF4E6',
              color: '#2c2416',
            }}
          />
        </div>
        <div>
          <label htmlFor="kaona_deeper_meaning" className="block font-body mb-2 text-sm font-medium" style={{ color: '#3d3424' }}>
            Kaona / Deeper Meaning *
          </label>
          <textarea
            id="kaona_deeper_meaning"
            required
            value={formData.kaona_deeper_meaning}
            onChange={(e) => setFormData({ ...formData, kaona_deeper_meaning: e.target.value })}
            onFocus={() => setFocusedField('kaona_deeper_meaning')}
            onBlur={() => setFocusedField(null)}
            onMouseEnter={() => setHoveredField('kaona_deeper_meaning')}
            onMouseLeave={() => setHoveredField(null)}
            rows={4}
            className={`w-full px-4 py-3 border-2 rounded-lg text-text font-body focus:outline-none transition-colors resize-none ${
              focusedField === 'kaona_deeper_meaning' || formData.kaona_deeper_meaning.trim().length > 0
                ? 'bg-highlight border-highlight'
                : hoveredField === 'kaona_deeper_meaning'
                ? 'bg-button border-highlight'
                : 'border-text/20'
            }`}
            style={{
              backgroundColor:
                focusedField === 'kaona_deeper_meaning' || formData.kaona_deeper_meaning.trim().length > 0
                  ? undefined
                  : hoveredField === 'kaona_deeper_meaning'
                  ? undefined
                  : '#FBF4E6',
              color: '#2c2416',
            }}
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-body mb-2 text-sm font-medium" style={{ color: '#3d3424' }}>
            Email *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            onMouseEnter={() => setHoveredField('email')}
            onMouseLeave={() => setHoveredField(null)}
            className={`w-full px-4 py-3 border-2 rounded-none text-text font-body focus:outline-none transition-colors ${
              focusedField === 'email' || formData.email.trim().length > 0
                ? 'bg-highlight border-highlight'
                : hoveredField === 'email'
                ? 'bg-button border-highlight'
                : 'border-text/20'
            }`}
            style={{
              backgroundColor:
                focusedField === 'email' || formData.email.trim().length > 0
                  ? undefined
                  : hoveredField === 'email'
                  ? undefined
                  : '#FBF4E6',
              color: '#2c2416',
            }}
          />
        </div>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="can_share_publicly"
            checked={formData.can_share_publicly}
            onChange={(e) => setFormData({ ...formData, can_share_publicly: e.target.checked })}
            className="mt-1 w-4 h-4 rounded border-text/20 text-highlight focus:ring-highlight focus:ring-2"
            style={{ accentColor: '#9cf6f6' }}
          />
          <label htmlFor="can_share_publicly" className="block font-body text-sm font-medium cursor-pointer" style={{ color: '#3d3424' }}>
            Can we share publicly?
          </label>
        </div>
        {message && (
          <div
            className={`p-4 rounded-lg border ${
              message.type === 'success' ? 'border-green-300/50' : 'border-red-300/50'
            }`}
            style={{
              backgroundColor: message.type === 'success' ? 'rgba(220, 252, 231, 0.6)' : 'rgba(254, 226, 226, 0.6)',
              color: message.type === 'success' ? '#166534' : '#991b1b',
            }}
          >
            {message.text}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="button-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </section>
  );
}
