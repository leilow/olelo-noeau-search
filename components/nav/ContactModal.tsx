'use client';

import { useEffect } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border-2 border-text/20 rounded-lg shadow-lg p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-heading font-bold" style={{ color: '#2c2416' }}>
            Contact
          </h2>
          <button
            onClick={onClose}
            className="text-text/60 hover:text-text transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-text/80">
            Questions? Comments? Email me{' '}
            <a
              href="mailto:olelonoeausearch@gmail.com"
              className="link-text hover:underline"
              style={{ color: '#2c2416' }}
            >
              olelonoeausearch@gmail.com
            </a>
            !
          </p>
        </div>
      </div>
    </div>
  );
}
