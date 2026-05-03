import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SportsListing() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      const { data, error } = await supabase.from('sports').select('*');
      if (data && data.length > 0) setSports(data);
      setLoading(false);
    };
    fetchSports();
  }, []);

  const fallbackSports = [
    { id: 'football', name: 'Football', image: '/assets/sports/football.jpg', price_per_hour: 1200, rating: 4.9 },
    { id: 'box_cricket', name: 'Box Cricket', image: '/assets/sports/box_cricket.jpg', price_per_hour: 1500, rating: 4.8 },
    { id: 'badminton', name: 'Badminton', image: '/assets/sports/badminton.jpg', price_per_hour: 400, rating: 4.5 },
    { id: 'tennis', name: 'Tennis', image: '/assets/sports/tennis.jpg', price_per_hour: 1000, rating: 4.6 },
    { id: 'drift_bikes', name: 'Drift Bikes', image: '/assets/sports/drift_bikes.jpg', price_per_hour: 2500, rating: 4.7 },
    { id: 'paintball', name: 'Paintball', image: '/assets/sports/paintball.jpg', price_per_hour: 2500, rating: 4.8 },
    { id: 'bowling', name: 'Bowling', image: '/assets/sports/bowling.jpg', price_per_hour: 1200, rating: 4.6 },
  ];

  const list = sports.length > 0 ? sports : fallbackSports;

  return (
    <div className="flex flex-col gap-6 p-4 pb-28">
      <header className="space-y-1">
        <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white">Choose Your Arena</h2>
        <p className="text-slate-500 font-medium text-sm">Professional grade turfs and activities.</p>
      </header>

      {loading && sports.length === 0 ? (
          <div className="py-20 text-center text-brand-500 font-bold animate-pulse">Loading Arenas...</div>
      ) : (
          <div className="flex flex-col gap-6">
              {list.map((sport, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={sport.id}
                  >
                    <Link 
                      to={`/booking/${sport.id}`} 
                      state={{ sport }}
                      className="group block relative h-64 rounded-[2rem] overflow-hidden shadow-glass dark:shadow-glass-dark"
                    >
                        <img 
                          src={sport.image || sport.image_url} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          alt={sport.name} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent z-10" />
                        
                        <div className="absolute top-4 left-4 z-20 flex gap-2">
                            <span className="bg-emerald-500/90 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm">
                              Available
                            </span>
                            {(sport.price_per_hour || sport.price) > 1000 && (
                                <span className="glass border-none text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase flex items-center gap-1 shadow-sm">
                                    <ShieldCheck size={12} className="text-brand-400" /> PRO
                                </span>
                            )}
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 z-20 flex items-end justify-between">
                            <div className="space-y-1">
                                <h4 className="font-display font-bold text-2xl text-white leading-none">
                                    {sport.name}
                                </h4>
                                <div className="flex items-center gap-3 text-white/80 text-sm font-medium">
                                    <span className="text-brand-400 font-bold text-lg">₹{sport.price_per_hour || sport.price}<span className="text-sm font-medium text-slate-300">/hr</span></span>
                                    <div className="flex items-center gap-1">
                                      <Star size={14} className="text-amber-400 fill-amber-400" />
                                      {sport.rating || '4.8'}
                                    </div>
                                </div>
                            </div>

                            <div className="w-12 h-12 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors shadow-lg">
                               <ArrowRight size={20} />
                            </div>
                        </div>
                    </Link>
                  </motion.div>
              ))}
          </div>
      )}

      {/* Seeding Help */}
      {!loading && sports.length === 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl text-red-600 dark:text-red-400 text-xs text-center font-medium">
              Mock data loaded. Check Supabase connection.
          </div>
      )}
    </div>
  );
}
