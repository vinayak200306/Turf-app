import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
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

  const bgColors = [
    'bg-pl-pink',
    'bg-pl-blue',
    'bg-pl-green',
    'bg-pl-yellow',
  ];

  return (
    <div className="flex flex-col gap-2 p-2 pb-28 font-sans bg-background min-h-screen">
      <header className="px-4 py-6 border-b-[3px] border-foreground mb-4">
        <h2 className="font-heavy text-5xl text-foreground uppercase tracking-wide leading-none">THE BEST</h2>
        <h2 className="font-heavy text-5xl text-foreground uppercase tracking-wide leading-none">ARENA</h2>
        <h2 className="font-heavy text-5xl text-white text-stroke uppercase tracking-wide leading-none">MATCH</h2>
      </header>

      {loading && sports.length === 0 ? (
          <div className="py-20 text-center text-foreground font-display text-2xl uppercase animate-pulse">Loading Arenas...</div>
      ) : (
          <div className="flex flex-col gap-0 rounded-[2.5rem] overflow-hidden border-[3px] border-foreground shadow-pl-solid mx-2">
              {list.map((sport, index) => {
                const colorClass = bgColors[index % bgColors.length];
                
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={sport.id}
                  >
                    <Link 
                      to={`/booking/${sport.id}`} 
                      state={{ sport }}
                      className={`group block relative p-6 border-b-[3px] border-foreground last:border-b-0 ${colorClass} hover:opacity-90 transition-opacity`}
                    >
                        <div className="flex items-center justify-between z-20 relative">
                            <div className="flex-1">
                                <span className="font-sans font-bold text-xs uppercase tracking-widest text-foreground/70 mb-1 block">Starts From</span>
                                <h4 className="font-heavy text-4xl text-foreground leading-none tracking-wide">
                                    ₹{sport.price_per_hour || sport.price}
                                </h4>
                            </div>
                            
                            <div className="flex-1 text-center px-2">
                                <h4 className="font-display text-3xl font-bold text-foreground uppercase leading-none tracking-wide">
                                    {sport.name}
                                </h4>
                                <span className="font-sans font-bold text-[10px] uppercase tracking-widest text-foreground/70 mt-1 block">Professional Turf</span>
                            </div>

                            <div className="flex-1 flex justify-end">
                               <div className="w-12 h-12 rounded-full border-2 border-foreground overflow-hidden">
                                  <img 
                                    src={sport.image || sport.image_url} 
                                    className="w-full h-full object-cover grayscale mix-blend-multiply" 
                                    alt={sport.name} 
                                  />
                               </div>
                            </div>
                        </div>
                    </Link>
                  </motion.div>
                )
              })}
          </div>
      )}

      {/* Sticky Call to Action */}
      <div className="fixed bottom-24 w-full max-w-[480px] px-4 z-40">
        <Link to="/booking/football">
          <button className="w-full bg-pl-brand text-white font-display text-2xl tracking-wider uppercase py-4 border-[3px] border-foreground shadow-pl-solid active:translate-y-1 active:shadow-none transition-all">
            CHOOSE THE ARENA
          </button>
        </Link>
      </div>

    </div>
  );
}
