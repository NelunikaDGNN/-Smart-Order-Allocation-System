import React, { useState, useEffect, useRef } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search…', debounceMs = 300 }) {
  const [localValue, setLocalValue] = useState(value);
  const debounceRef = useRef(null);


  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (e) => {
    const next = e.target.value;
    setLocalValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(next), debounceMs);
  };

  return (
    <input
      type="text"
       className="w-full flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
    />
  );
}