import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const categories = [
    { id: 'football', name: 'FOOTBALL', img: '/assets/sports/football.jpg', color: 'bg-pl-blue' },
    { id: 'box_cricket', name: 'CRICKET', img: '/assets/sports/box_cricket.jpg', color: 'bg-pl-green' },
    { id: 'bowling', name: 'BOWLING', img: '/assets/sports/bowling.jpg', color: 'bg-pl-yellow' }
  ];

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Hero Section */}
      <section className="px-4 pt-4 border-b-[3px] border-foreground pb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-sans font-bold text-xs uppercase tracking-widest text-foreground/70 mb-1">Current Location</p>
            <div className="flex items-center gap-1 text-foreground font-heavy text-xl uppercase tracking-wide">
              <MapPin size={20} className="text-pl-brand" strokeWidth={3} />
              Karnataka Bhavan Arena
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-foreground overflow-hidden shadow-pl-solid">
            <img src="https://ui-avatars.com/api/?name=User&background=0F172A&color=fff" alt="User" />
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden border-[3px] border-foreground shadow-pl-solid mb-6">
          <img src="/assets/hero_wallpaper.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex flex-col p-6 z-10 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          >
            <h2 className="font-heavy text-7xl text-white leading-none uppercase tracking-tight">BOOK</h2>
            <h2 className="font-heavy text-7xl text-pl-brand leading-none uppercase tracking-tight drop-shadow-md">YOUR</h2>
            <h2 className="font-heavy text-7xl text-white leading-[0.8] uppercase tracking-tight mb-2">GAME</h2>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-4 bg-white border-[3px] border-foreground shadow-pl-solid rounded-xl focus-within:-translate-y-1 focus-within:shadow-[6px_6px_0px_rgba(15,23,42,1)] transition-all">
          <Search size={24} className="text-foreground" strokeWidth={3} />
          <input 
            type="text" 
            placeholder="FIND ARENAS..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                navigate(`/sports?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
            className="bg-transparent border-none outline-none w-full font-display text-xl uppercase tracking-wider text-foreground placeholder:text-foreground/40"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heavy text-4xl text-foreground uppercase tracking-wide">TOP SPORTS</h3>
          <Link to="/sports" className="font-sans font-bold text-xs uppercase tracking-widest text-pl-brand border-b-2 border-pl-brand">
            SEE ALL
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {categories.map((cat, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={cat.id} 
            >
              <Link to={`/booking/${cat.id}`} className={`block relative h-32 rounded-2xl overflow-hidden border-[3px] border-foreground shadow-pl-solid ${cat.color} group`}>
                <div className="absolute right-0 top-0 w-1/2 h-full border-l-[3px] border-foreground bg-white">
                   <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="absolute inset-0 p-5 flex flex-col justify-center w-1/2">
                    <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-foreground/70 mb-1">Book Now</span>
                    <h4 className="font-heavy text-4xl text-foreground leading-none">{cat.name}</h4>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions / Banners */}
      <section className="px-4 mt-2">
        <div className="bg-foreground rounded-2xl p-6 border-[3px] border-foreground shadow-pl-solid relative overflow-hidden text-center">
          <h3 className="text-4xl font-heavy text-white mb-2 uppercase tracking-wide">JOIN THE LEAGUE</h3>
          <p className="text-white/80 font-sans font-bold text-sm uppercase tracking-widest mb-4">Compete with the best teams</p>
          <button className="bg-pl-yellow text-foreground border-2 border-foreground font-heavy text-2xl uppercase px-8 py-2 w-full hover:bg-white transition-colors">
            REGISTER
          </button>
        </div>
      </section>
    </div>
  );
}
