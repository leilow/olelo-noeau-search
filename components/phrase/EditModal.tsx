'use client';

import { useEffect } from 'react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  phraseNumber: number;
}

export default function EditModal({ isOpen, onClose, phraseNumber }: EditModalProps) {
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

  const emailSubject = encodeURIComponent(`Edit Request: Phrase #${phraseNumber}`);
  const emailBody = encodeURIComponent(`I would like to suggest an edit for phrase #${phraseNumber}:\n\n`);

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
            Suggest Edit
          </h2>
          <button
            onClick={onClose}
            className="text-text/60 hover:text-text transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          <p className="font-body text-text/80" style={{ color: '#3d3424' }}>
            Email us to suggest an edit for phrase #{phraseNumber}:
          </p>
          <a
            href={`mailto:olelonoeausearch@gmail.com?subject=${emailSubject}&body=${emailBody}`}
            className="link-text text-lg hover:underline block"
            style={{ color: '#2c2416' }}
          >
            olelonoeausearch@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
