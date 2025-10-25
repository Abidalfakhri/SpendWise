import React from 'react';

export default function Input({ label, hint, error, className = '', ...props }) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="text-xs text-slate-400">{label}</label>}
      <input
        className="w-full mt-1 rounded bg-slate-800 text-white p-2 outline-none focus:ring-2 focus:ring-emerald-600"
        {...props}
      />
      {hint && !error && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
      {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
    </div>
  );
}