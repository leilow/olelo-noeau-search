'use client';

import { useState, useEffect } from 'react';

const FADE_START = 100; // Start fading after 100px scroll
const FADE_END = 300; // Fully faded at 300px scroll

export default function SearchHero() {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      let opacity = 1;
      
      if (scrollY > FADE_START) {
        const fadeRange = FADE_END - FADE_START;
        const scrolled = scrollY - FADE_START;
        opacity = Math.max(0, 1 - (scrolled / fadeRange));
      }
      
      setScrollOpacity(opacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="w-full max-w-4xl mx-auto mb-6 transition-opacity duration-300"
      style={{ opacity: scrollOpacity }}
    >
      <div 
        className="relative w-full aspect-video overflow-hidden rounded-none bg-button"
        style={{
          backgroundImage: 'url(/images/pukui-portrait-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Duotone overlay - brown and beige */}
        <div 
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to bottom, rgba(101, 67, 33, 0.6), rgba(250, 237, 205, 0.5))',
            mixBlendMode: 'multiply',
            pointerEvents: 'none',
            willChange: 'auto'
          }}
        />
      </div>
    </div>
  );
}
