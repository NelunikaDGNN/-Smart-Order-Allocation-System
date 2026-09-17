import React, { useState, startTransition } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    setConfirmLogout(false);
    logout();
    navigate('/login');
  };

  const go = (path) => (e) => {
    e.preventDefault();
    const overlay = document.getElementById('route-overlay');
    if (overlay) overlay.style.opacity = '1';
    startTransition(() => {
      navigate(path);
    });
  };

  const linkClass = ({ isActive }) =>
    `pb-1 border-b-2 transition-colors ${
      isActive
        ? 'text-brand-600 border-brand-600 font-medium'
        : 'text-gray-600 border-transparent hover:text-brand-600'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `transition-colors ${
      isActive
        ? 'text-brand-600 font-medium'
        : 'text-gray-800'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
        <NavLink to={isAdmin ? '/admin' : '/'} onClick={go(isAdmin ? '/admin' : '/')} className="font-bold text-brand-600">
          Smart Order Allocation
        </NavLink>

        <button
          className="sm:hidden text-gray-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

        <div className="hidden sm:flex items-center gap-4 text-sm">
          {isAdmin && <NavLink to="/admin" onClick={go('/admin')} className={linkClass}>Admin</NavLink>}
          {user && !isAdmin && <NavLink to="/" end onClick={go('/')} className={linkClass}>Place order</NavLink>}
          {user && !isAdmin && <NavLink to="/orders" onClick={go('/orders')} className={linkClass}>My orders</NavLink>}
          {user ? (
            <button onClick={() => setConfirmLogout(true)} className="text-gray-600 pb-1 border-b-2 border-transparent">
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" onClick={go('/login')} className={linkClass}>Login</NavLink>
              <NavLink to="/register" onClick={go('/register')} className={linkClass}>Register</NavLink>
            </>
          )}
        </div>
      </div>

      {open && (
        <div className="sm:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 text-sm">
          {isAdmin && <NavLink to="/admin" onClick={(e) => { setOpen(false); go('/admin')(e); }} className={mobileLinkClass}>Admin</NavLink>}
          {user && !isAdmin && <NavLink to="/" end onClick={(e) => { setOpen(false); go('/')(e); }} className={mobileLinkClass}>Place order</NavLink>}
          {user && !isAdmin && <NavLink to="/orders" onClick={(e) => { setOpen(false); go('/orders')(e); }} className={mobileLinkClass}>My orders</NavLink>}
          {user ? (
            <button onClick={() => { setOpen(false); setConfirmLogout(true); }} className="text-left text-gray-800">
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" onClick={(e) => { setOpen(false); go('/login')(e); }} className={mobileLinkClass}>Login</NavLink>
              <NavLink to="/register" onClick={(e) => { setOpen(false); go('/register')(e); }} className={mobileLinkClass}>Register</NavLink>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message="You'll need to sign in again to place or view orders."
        confirmLabel="Logout"
        cancelLabel="Stay"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </nav>
  );
}