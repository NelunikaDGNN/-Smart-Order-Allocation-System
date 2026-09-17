import React from 'react';

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 text-slate-500 text-sm py-6 justify-center">
      <div className="h-4 w-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <span>{label}</span>
    </div>
  );
}
