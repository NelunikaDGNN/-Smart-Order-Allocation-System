import React from 'react';
import { Check } from 'lucide-react';
import { PASSWORD_RULES } from '../../utils/password';

export default function PasswordRules({ password }) {
  return (
    <ul className="space-y-1" aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.key}
            className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
              passed ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span
              className={`flex items-center justify-center w-3.5 h-3.5 rounded-full border transition-colors duration-200 ${
                passed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 text-transparent'
              }`}
            >
              <Check size={10} strokeWidth={3} />
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}