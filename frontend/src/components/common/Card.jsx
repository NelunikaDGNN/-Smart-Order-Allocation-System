import React from 'react';

export default function Card({ className = '', children }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}
