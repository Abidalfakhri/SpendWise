import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { FiMenu, FiUser, FiSettings, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // ✅ Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-[9999] relative">
      {/* Kiri: Logo dan Sidebar */}
      <div className="flex items-center gap-3">
        {/* Tombol sidebar mobile */}
        <button
          className="md:hidden px-2 py-1 rounded bg-slate-800"
          onClick={onToggleSidebar}
        >
          ☰
        </button>

        {/* Tombol sidebar desktop */}
        <button
          className="hidden md:inline-flex text-white hover:text-emerald-400"
          onClick={onToggleSidebar}
        >
          <FiMenu size={20} />
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/src/assets/logo.svg" alt="SpendWise" className="h-8 w-8" />
          <span className="font-semibold text-white text-lg">SpendWise</span>
        </Link>

        <span className="text-xs text-slate-400 hidden md:inline">
          / {location.pathname.replace('/', '') || 'home'}
        </span>
      </div>

      {/* Kanan: Theme + User */}
      <div className="flex items-center gap-4 relative">
        {/* Tombol theme */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition"
        >
          {theme === 'light' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {user ? (
          <div ref={menuRef} className="relative z-[9999]">
            {/* Avatar */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="block focus:outline-none"
            >
              <img
                src={user.avatar || '/src/assets/avatar-default.png'}
                alt="Profil"
                className="h-8 w-8 rounded-full border-2 border-emerald-500 hover:scale-105 transition"
              />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-[9999] overflow-hidden"
                >
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
                  >
                    <FiUser size={14} /> Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition"
                  >
                    <FiSettings size={14} /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition"
                  >
                    <FiLogOut size={14} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-sm"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
