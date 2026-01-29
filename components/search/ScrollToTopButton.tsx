'use client';

import { useState, useEffect } from 'react';

const scrollToSearchBar = () => {
  const resultsStart = document.getElementById('results-start');
  if (resultsStart) {
    // Get header height to account for it
    const header = document.querySelector('nav');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    // Scroll to results area, accounting for header
    const offset = resultsStart.getBoundingClientRect().top + window.scrollY - headerHeight - 20; // 20px padding above
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
};

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 200px
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToSearchBar}
      className="fixed bottom-6 right-6 z-50 bg-highlight text-text font-mono text-[11pt] font-normal px-4 py-2 rounded-none border-2 border-transparent hover:border-highlight hover:underline transition-all shadow-sm"
      style={{ textDecorationThickness: '1px', textUnderlineOffset: '2px' }}
      aria-label="Scroll to search"
    >
      Top
    </button>
  );
}
