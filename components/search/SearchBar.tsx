'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    // Always update immediately for responsive UI, but search will debounce
    onChange(newValue);
  };

  const hasText = localValue.trim().length > 0;
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        placeholder="Search phrases (2+ characters)..."
        className={`w-full px-4 py-3 border-2 rounded-none text-text font-body focus:outline-none transition-colors ${
          hasText
            ? 'bg-highlight border-highlight' // Active search: blue background and border
            : isFocused
            ? 'bg-highlight border-highlight' // Focused with no text: blue background and border
            : isHovered
            ? 'bg-button border-highlight' // Hover: beige background, blue line
            : 'bg-button border-transparent' // Default: beige background, no line
        }`}
      />
      {localValue && (
        <button
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text/50 hover:text-text font-bold text-xl"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
