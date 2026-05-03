import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, User as UserIcon, LogOut, Clock, Activity, CreditCard, ChevronRight } from 'lucide-react';
import { useUser, useAuth, SignInButton, SignOutButton } from '@clerk/clerk-react';

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (isSignedIn && user) {
        // Fallback: If not using Supabase RLS with Clerk token yet, just query by clerk id or mock
        const { data, error } = await supabase
          .from('bookings')
          .select('*, sports(*)')
          // We assume user_id is the clerk user id if we setup custom claims, but for now we might not have bookings.
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        if (data) setBookings(data);
      }
      setLoading(false);
    };

    if (isLoaded) {
      fetchBookings();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || loading) return <div className="h-screen flex items-center justify-center font-bold text-brand-500 animate-pulse">Loading Profile...</div>;

  if (!isSignedIn) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-6">
              <div className="w-24 h-24 rounded-[2rem] glass flex items-center justify-center shadow-xl">
                  <UserIcon size={40} className="text-brand-500" />
              </div>
              <div className="space-y-2">
                  <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white">Guest Player</h2>
                  <p className="text-slate-500 text-sm font-medium">Sign in to track your sessions and book arenas seamlessly.</p>
              </div>
              <SignInButton mode="modal">
                <button className="bg-gradient-brand text-white font-bold px-10 py-4 rounded-2xl shadow-lg hover:shadow-brand-500/50 hover:-translate-y-1 transition-all">
                    Sign In / Register
                </button>
              </SignInButton>
          </div>
      );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-28 font-sans">
      <header className="space-y-1 mt-4">
        <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white">Dashboard</h2>
      </header>

      {/* Profile Card */}
      <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-brand-500 opacity-5 text-8xl font-black rotate-12 select-none">PRO</div>
          <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <img src={user.imageUrl} alt="Profile" className="w-16 h-16 rounded-2xl border-2 border-brand-100 dark:border-brand-900/50 shadow-md object-cover" />
                    <div>
                      <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">{user.fullName || 'Athlete'}</h3>
                      <p className="text-slate-500 text-xs font-medium">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                  <SignOutButton>
                    <button className="text-slate-400 hover:text-red-500 transition-colors p-2 glass rounded-full" aria-label="Sign out">
                        <LogOut size={16} />
                    </button>
                  </SignOutButton>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Matches</span>
                  <span className="font-display font-bold text-2xl text-slate-900 dark:text-white">{bookings.length}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Status</span>
                  <span className="font-display font-bold text-xl text-brand-500 flex items-center justify-center gap-1"><Activity size={14} /> PRO</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-800">
                  <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Points</span>
                  <span className="font-display font-bold text-2xl text-amber-500">240</span>
                </div>
              </div>
          </div>
      </div>

      {/* Bookings List */}
      <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h4 className="font-display font-bold text-xl text-slate-900 dark:text-white">Upcoming Sessions</h4>
            <span className="text-brand-500 text-xs font-bold uppercase tracking-wider">View All</span>
          </div>

          {bookings.length === 0 ? (
              <div className="glass rounded-[2rem] p-10 text-center flex flex-col items-center justify-center gap-4">
                  <Calendar size={48} className="text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 font-medium text-sm">No sessions booked yet.<br/>Time to hit the field!</p>
              </div>
          ) : (
              <div className="flex flex-col gap-4">
                  {bookings.map((booking, index) => (
                      <motion.div 
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4"
                      >
                          <div className="flex justify-between items-start">
                              <div className="flex gap-4 items-center">
                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100">
                                    {booking.sports?.image_url && <img src={booking.sports.image_url} alt="sport" className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="space-y-1">
                                      <h5 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-none">{booking.sports?.name || 'Arena Session'}</h5>
                                      <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                          <Calendar size={12} className="text-brand-500" /> {booking.date}
                                      </div>
                                  </div>
                              </div>
                              <span className={clsx(
                                "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                                booking.status === 'CONFIRMED' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-600"
                              )}>
                                  {booking.status}
                              </span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                 <Clock size={16} className="text-amber-500" /> {booking.start_time.slice(0,5)}
                             </div>
                             <div className="flex items-center gap-3">
                                 <div className="text-right">
                                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pax</span>
                                     <span className="font-bold text-slate-900 dark:text-white">{booking.players_count}</span>
                                 </div>
                                 <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-brand-500 transition-colors">
                                  <ChevronRight size={16} />
                                 </button>
                             </div>
                          </div>
                      </motion.div>
                  ))}
              </div>
          )}
      </section>
    </div>
  );
}
