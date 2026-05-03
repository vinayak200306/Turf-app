import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';
import { LogOut, Activity } from 'lucide-react';
import { useUser, useAuth, SignInButton, SignOutButton } from '@clerk/clerk-react';

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (isSignedIn && user) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, sports(*)')
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

  if (!isLoaded || loading) return <div className="h-screen flex items-center justify-center font-heavy text-4xl text-foreground uppercase animate-pulse">LOADING PROFILE...</div>;

  if (!isSignedIn) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-6">
              <div className="w-24 h-24 border-[3px] border-foreground bg-pl-yellow flex items-center justify-center shadow-pl-solid">
                  <span className="font-heavy text-5xl">?</span>
              </div>
              <div className="space-y-2">
                  <h2 className="font-heavy text-4xl uppercase">GUEST PLAYER</h2>
                  <p className="font-sans font-bold text-xs tracking-widest uppercase text-foreground/60">SIGN IN TO TRACK SESSIONS</p>
              </div>
              <SignInButton mode="modal">
                <button className="bg-pl-brand text-white border-[3px] border-foreground font-heavy text-3xl py-4 px-10 shadow-pl-solid hover:-translate-y-1 transition-all">
                    SIGN IN / REGISTER
                </button>
              </SignInButton>
          </div>
      );
  }

  return (
    <div className="flex flex-col gap-6 pb-28 font-sans">
      <header className="px-4 py-6 border-b-[3px] border-foreground mb-2">
        <h2 className="font-heavy text-5xl text-foreground uppercase tracking-wide leading-none">PLAYER</h2>
        <h2 className="font-heavy text-5xl text-foreground uppercase tracking-wide leading-none">DASHBOARD</h2>
      </header>

      {/* Profile Card */}
      <section className="px-4">
        <div className="bg-pl-yellow border-[3px] border-foreground p-6 relative overflow-hidden shadow-pl-solid">
            <div className="absolute -right-2 -top-4 text-foreground/10 text-[10rem] font-heavy rotate-12 select-none leading-none">PRO</div>
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 border-[3px] border-foreground overflow-hidden bg-white shadow-pl-solid">
                        <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-sans font-bold text-[10px] tracking-widest uppercase mb-1 block">WELCOME BACK</span>
                        <h3 className="font-heavy text-3xl uppercase leading-none">{user.fullName || 'ATHLETE'}</h3>
                        <p className="font-sans font-bold text-[10px] tracking-widest uppercase mt-1">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>
                    <SignOutButton>
                      <button className="text-foreground hover:bg-white border-[3px] border-foreground p-2 bg-background shadow-pl-solid transition-colors" aria-label="Sign out">
                          <LogOut size={20} strokeWidth={3} />
                      </button>
                    </SignOutButton>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white border-[3px] border-foreground p-3 text-center shadow-[2px_2px_0px_rgba(15,23,42,1)]">
                    <span className="block font-sans font-bold text-[10px] uppercase tracking-wider mb-1">MATCHES</span>
                    <span className="font-heavy text-3xl leading-none">{bookings.length}</span>
                  </div>
                  <div className="bg-white border-[3px] border-foreground p-3 text-center shadow-[2px_2px_0px_rgba(15,23,42,1)]">
                    <span className="block font-sans font-bold text-[10px] uppercase tracking-wider mb-1">STATUS</span>
                    <span className="font-heavy text-2xl text-pl-brand leading-none flex items-center justify-center gap-1 mt-1"><Activity size={16} strokeWidth={4} /> PRO</span>
                  </div>
                  <div className="bg-white border-[3px] border-foreground p-3 text-center shadow-[2px_2px_0px_rgba(15,23,42,1)]">
                    <span className="block font-sans font-bold text-[10px] uppercase tracking-wider mb-1">POINTS</span>
                    <span className="font-heavy text-3xl leading-none text-pl-green">240</span>
                  </div>
                </div>
            </div>
        </div>
      </section>

      {/* Bookings List */}
      <section className="px-4 space-y-4">
          <div className="flex justify-between items-end border-b-[3px] border-foreground pb-2">
            <h4 className="font-heavy text-3xl uppercase leading-none">UPCOMING SESSIONS</h4>
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-pl-brand border-b-[3px] border-pl-brand">VIEW ALL</span>
          </div>

          {bookings.length === 0 ? (
              <div className="bg-white border-[3px] border-foreground rounded-[2rem] p-10 text-center flex flex-col items-center justify-center gap-4 shadow-pl-solid">
                  <div className="font-heavy text-8xl text-foreground/20 leading-none">?</div>
                  <p className="font-sans font-bold text-sm uppercase tracking-widest">NO SESSIONS YET.<br/>TIME TO HIT THE FIELD!</p>
              </div>
          ) : (
              <div className="flex flex-col gap-4">
                  {bookings.map((booking, index) => {
                    const bgColors = ['bg-pl-blue', 'bg-pl-green', 'bg-pl-pink'];
                    const colorClass = bgColors[index % bgColors.length];

                    return (
                      <motion.div 
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`border-[3px] border-foreground shadow-pl-solid flex flex-col ${colorClass} hover:-translate-y-1 transition-transform`}
                      >
                          <div className="flex justify-between items-center p-4 border-b-[3px] border-foreground bg-white">
                              <span className="font-sans font-bold text-[10px] uppercase tracking-widest">
                                  {booking.date}
                              </span>
                              <span className={`font-heavy text-xl uppercase leading-none px-3 py-1 border-[3px] border-foreground ${booking.status === 'CONFIRMED' ? "bg-pl-green" : "bg-pl-brand text-white"}`}>
                                  {booking.status}
                              </span>
                          </div>
                          
                          <div className="flex justify-between items-center p-4">
                              <div>
                                <span className="font-sans font-bold text-[10px] tracking-widest uppercase mb-1 block">SPORT</span>
                                <h5 className="font-heavy text-4xl uppercase leading-none">{booking.sports?.name || 'ARENA'}</h5>
                              </div>
                              <div className="text-right">
                                <span className="font-sans font-bold text-[10px] tracking-widest uppercase mb-1 block">TIME</span>
                                <span className="font-heavy text-3xl leading-none">{booking.start_time.slice(0,5)}</span>
                              </div>
                          </div>
                          
                          <div className="flex justify-between items-center p-4 border-t-[3px] border-foreground bg-background">
                            <span className="font-sans font-bold text-[10px] tracking-widest uppercase">PLAYERS: <span className="font-heavy text-lg">{booking.players_count}</span></span>
                            <button className="font-sans font-bold text-[10px] tracking-widest uppercase border-b-2 border-foreground hover:text-pl-brand">MANAGE</button>
                          </div>
                      </motion.div>
                    )
                  })}
              </div>
          )}
      </section>
    </div>
  );
}
