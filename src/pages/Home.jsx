import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Search, Activity, ChevronRight, Star } from 'lucide-react';

export default function Home() {
  const categories = [
    { id: 'football', name: 'Football', img: '/assets/sports/football.jpg', rating: 4.9 },
    { id: 'box_cricket', name: 'Box Cricket', img: '/assets/sports/box_cricket.jpg', rating: 4.8 },
    { id: 'bowling', name: 'Bowling', img: '/assets/sports/bowling.jpg', rating: 4.7 }
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero Section */}
      <section className="relative px-4 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-slate-500 font-medium dark:text-slate-400">Current Location</p>
            <div className="flex items-center gap-1 text-slate-900 dark:text-white font-semibold">
              <MapPin size={16} className="text-brand-500" />
              Gadag, Karnataka
            </div>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden glass shadow-sm">
            <img src="https://ui-avatars.com/api/?name=User&background=0F172A&color=fff" alt="User" />
          </div>
        </div>

        <div className="relative h-48 w-full rounded-3xl overflow-hidden shadow-2xl mb-6">
          <img 
            src="/assets/sports/football.jpg" 
            className="w-full h-full object-cover"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/40" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-display font-bold text-white mb-2 leading-tight"
            >
              BOOK YOUR <br/><span className="text-brand-400">GAME</span>
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-sm font-medium"
            >
              Elite turf booking at your fingertips.
            </motion.p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-card flex items-center gap-3 px-4 py-3">
          <Search size={20} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search for arenas, sports..." 
            className="bg-transparent border-none outline-none w-full text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">Featured Sports</h3>
          <Link to="/sports" className="text-sm font-semibold text-brand-500 flex items-center">
            See all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
          {categories.map((cat, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={cat.id} 
              className="min-w-[200px] snap-center"
            >
              <Link to={`/booking/${cat.id}`} className="block relative h-64 rounded-3xl overflow-hidden group shadow-lg">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-display font-bold text-white text-xl">{cat.name}</h4>
                      <p className="text-slate-300 text-xs flex items-center gap-1 mt-1">
                        <Activity size={12} className="text-brand-400" /> High Demand
                      </p>
                    </div>
                    <div className="glass px-2 py-1 rounded-xl flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-white text-xs font-bold">{cat.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions / Banners */}
      <section className="px-4 mb-4">
        <div className="bg-gradient-brand rounded-3xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative z-10">
            <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg mb-3 inline-block">
              Tournaments
            </span>
            <h3 className="text-2xl font-display font-bold text-white mb-1">Join the League</h3>
            <p className="text-white/80 text-sm mb-4">Compete with the best teams.</p>
            <button className="bg-white text-brand-600 font-bold text-sm px-5 py-2 rounded-xl shadow-md hover:scale-105 transition-transform">
              Register Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
