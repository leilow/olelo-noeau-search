import { useEffect } from 'react';

/** Lock body scroll when open; restore on close. Use for modals/dialogs. */
export function useModalBodyScroll(isOpen: boolean): void {
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
}
