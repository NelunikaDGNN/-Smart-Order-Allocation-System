import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/branches', label: 'Branches' },
  { to: '/admin/support', label: 'Support' },
];


export default function AdminSidebar() {
  return (
    <>
      <aside className="hidden md:block w-56 shrink-0 border-r border-gray-100 bg-white min-h-[calc(100vh-57px)] px-3 py-6">
        <nav className="space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="md:hidden flex border-b border-gray-100 bg-white px-2 overflow-x-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                isActive ? 'border-brand-500 text-brand-700' : 'border-transparent text-gray-500'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
    </>
  );
}