'use client';

import { useEffect } from 'react';

interface CopyToastProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function CopyToast({ isVisible, onClose }: CopyToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="bg-background border-2 border-text/20 rounded-lg shadow-lg px-6 py-4">
        <p className="font-mono text-sm text-text" style={{ color: '#2c2416' }}>
          ✓ Copied with attribution
        </p>
      </div>
    </div>
  );
}
