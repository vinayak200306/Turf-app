import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Calendar, User, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import clsx from 'clsx';

export default function MobileLayout({ children }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Sports', path: '/sports', icon: Trophy },
    { name: 'Bookings', path: '/dashboard', icon: Calendar },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth font-sans">
      {/* App Header */}
      <header className="fixed top-0 left-0 w-full h-16 z-50 glass flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center font-display font-bold text-white shadow-lg">
            A
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-sports-orange">
            ARENA
          </h1>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-20 pb-28 overflow-x-hidden px-4 md:px-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-0 w-full flex justify-center z-50 px-4">
        <nav className="glass rounded-full px-6 py-4 flex justify-between items-center w-full max-w-sm shadow-2xl">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "relative flex flex-col items-center justify-center gap-1 transition-all duration-300",
                  isActive ? "text-brand-500 scale-110" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute -inset-2 bg-brand-100 dark:bg-brand-900/30 rounded-full z-[-1]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={clsx("text-[10px] font-medium mt-1", isActive ? "font-semibold" : "")}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
