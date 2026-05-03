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
    { name: 'HOME', path: '/', icon: Home },
    { name: 'SPORTS', path: '/sports', icon: Trophy },
    { name: 'SESSIONS', path: '/dashboard', icon: Calendar },
    { name: 'PROFILE', path: '/profile', icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground scroll-smooth font-sans">
      {/* App Header */}
      <header className="fixed top-0 w-full max-w-[480px] z-50 bg-background border-b-[3px] border-foreground px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
            <Trophy size={20} className="text-background" strokeWidth={3} />
          </div>
          <div className="flex flex-col leading-none">
            <h1 className="font-heavy text-2xl tracking-wide uppercase mt-1">
              TURF <span className="text-pl-brand">LEAGUE</span>
            </h1>
          </div>
        </div>
        <button 
          onClick={toggleTheme}
          className="p-2 border-2 border-foreground rounded-full hover:bg-foreground hover:text-background transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow pt-[72px] pb-32 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full max-w-[480px] flex justify-center z-50 bg-background border-t-[3px] border-foreground px-2 py-2">
        <nav className="flex justify-between items-center w-full px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "relative flex flex-col items-center justify-center p-3 w-20 rounded-xl transition-all duration-300",
                  isActive ? "bg-pl-brand text-white shadow-pl-solid" : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 3 : 2} />
                <span className={clsx("font-display text-sm tracking-wider mt-1", isActive ? "font-bold" : "font-medium")}>
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
