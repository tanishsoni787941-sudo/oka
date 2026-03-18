import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut, User, Menu, X, ShieldCheck, Info, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: <User className="h-4 w-4" /> },
    { name: 'About Us', path: '/about', icon: <Info className="h-4 w-4" /> },
    { name: 'Support', path: '/support', icon: <MessageCircle className="h-4 w-4" /> },
  ];

  if (profile?.role === 'admin') {
    navLinks.push({ name: 'Admin', path: '/admin', icon: <ShieldCheck className="h-4 w-4" /> });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-black text-stone-900 dark:text-white tracking-tight hidden sm:block">
                Organic Mushroom <span className="text-purple-600">Farm</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-stone-600 dark:text-stone-400 hover:text-purple-600 dark:hover:text-purple-400 font-medium transition-colors flex items-center gap-2"
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-stone-200 dark:bg-stone-800 mx-2" />

            <button
              onClick={toggleTheme}
              className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {user && (
              <button
                onClick={handleLogout}
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-all"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {user && navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition-colors flex items-center gap-3"
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-4 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center gap-3"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
