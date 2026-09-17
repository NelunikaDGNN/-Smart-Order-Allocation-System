import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">404</h1>
      <p className="text-gray-500 mb-4">Page not found.</p>
      <Link to="/" className="text-brand-600 font-medium">Go home</Link>
    </div>
  );
}
