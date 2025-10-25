import React, { useEffect } from 'react';

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.();
    if (open) {
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded border border-slate-800 bg-slate-900 p-4 shadow-xl">
          {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
          {children}
        </div>
      </div>
    </div>
  );
}   