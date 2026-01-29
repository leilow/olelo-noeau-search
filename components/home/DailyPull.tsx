'use client';

import { Phrase } from '@/lib/types/database';
import PhraseCard from '@/components/phrase/PhraseCard';
import { useState, useEffect } from 'react';

interface DailyPullData {
  phrase: Phrase;
  moonPhase: string;
  weather: string;
}

export default function DailyPull() {
  const [data, setData] = useState<DailyPullData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRandom, setIsRandom] = useState(false);

  const fetchDailyPull = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/daily-pull', { cache: 'no-store' });
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setIsRandom(false);
      } else {
        setError(response.status === 404 ? 'No phrases in database yet.' : `Could not load (${response.status}).`);
      }
    } catch (error) {
      console.error('Error fetching daily pull:', error);
      setError('Network or server error.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRandom = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/random-phrase', { cache: 'no-store' });
      if (response.ok) {
        const result = await response.json();
        setData(result);
        setIsRandom(true);
      } else {
        setError(`Could not load (${response.status}).`);
      }
    } catch (error) {
      console.error('Error fetching random phrase:', error);
      setError('Network or server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyPull();
  }, []);

  if (loading && !data) {
    return (
      <section className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-sm" style={{ backgroundColor: 'rgba(234, 234, 210, 0.7)' }}>
        <h2 className="text-2xl font-heading font-bold mb-4" style={{ color: '#2c2416' }}>Daily Pull</h2>
        <p className="text-text/70" style={{ color: '#5a4f3f' }}>Loading...</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-sm" style={{ backgroundColor: 'rgba(234, 234, 210, 0.7)' }}>
        <h2 className="text-2xl font-heading font-bold mb-4" style={{ color: '#2c2416' }}>Daily Pull</h2>
        <p className="text-text/70" style={{ color: '#5a4f3f' }}>
          {error || 'Unable to load daily phrase.'}
        </p>
        <button onClick={fetchDailyPull} className="button-base mt-2">Try again</button>
      </section>
    );
  }

  return (
    <section className="bg-white/60 backdrop-blur-sm p-6 rounded-lg shadow-sm space-y-5" style={{ backgroundColor: 'rgba(234, 234, 210, 0.7)' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold" style={{ color: '#2c2416' }}>
          {isRandom ? 'Random Pull' : 'Daily Pull'}
        </h2>
        <div className="flex gap-2">
          {isRandom && (
            <button
              onClick={fetchDailyPull}
              disabled={loading}
              className="button-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Daily'}
            </button>
          )}
          <button
            onClick={fetchRandom}
            disabled={loading}
            className="button-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Random'}
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-highlight text-text px-3 py-1.5 rounded-full font-mono text-xs">
          {data.moonPhase}
        </span>
        <span className="bg-highlight text-text px-3 py-1.5 rounded-full font-mono text-xs">
          {data.weather}
        </span>
      </div>
      
      <PhraseCard phrase={data.phrase} isSearchPage={true} />
    </section>
  );
}
