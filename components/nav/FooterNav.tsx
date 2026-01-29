'use client';

import { useState } from 'react';
import ContactModal from './ContactModal';

export default function FooterNav() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-button/30 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6">
              <span className="link-text text-text/50 cursor-not-allowed">
                Project Info (soon)
              </span>
              <span className="link-text text-text/50 cursor-not-allowed">
                Account (soon)
              </span>
            </div>
            <div>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="link-text hover:underline"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
