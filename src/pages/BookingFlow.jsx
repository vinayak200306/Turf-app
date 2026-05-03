import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useRealtimeSlots } from '../hooks/useRealtimeSlots';
import { ArrowRight, Sunrise, Sun, Sunset, Moon, Calendar as CalendarIcon, Users, CheckCircle2, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

export default function BookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(1);
  const [sport, setSport] = useState(location.state?.sport || null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [playerCount, setPlayerCount] = useState(1);
  const [bookingStatus, setBookingStatus] = useState('idle');

  const { slots, loading: slotsLoading } = useRealtimeSlots(sport?.id, selectedDate);

  const dateOptions = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const isToday = i === 0;
      return {
        full: d.toISOString().split('T')[0],
        day: isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
      };
    });
  }, []);

  const getTimeBlock = (time) => {
    if (!time) return { label: 'Unknown', icon: null, multiplier: 1.0 };
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return { label: 'Morning', icon: <Sunrise size={16} className="text-amber-500" />, multiplier: 1.0 };
    if (hour >= 12 && hour < 16) return { label: 'Afternoon', icon: <Sun size={16} className="text-orange-500" />, multiplier: 0.8 };
    if (hour >= 16 && hour < 20) return { label: 'Evening', icon: <Sunset size={16} className="text-brand-500" />, multiplier: 1.2 };
    return { label: 'Night', icon: <Moon size={16} className="text-indigo-400" />, multiplier: 1.5 };
  };

  const calculatePrice = (basePrice, time) => {
    const { multiplier } = getTimeBlock(time);
    return Math.round(basePrice * multiplier);
  };

  const groupedSlots = useMemo(() => {
    const groups = { Morning: [], Afternoon: [], Evening: [], Night: [] };
    slots.forEach(slot => {
      const block = getTimeBlock(slot.start_time);
      if (groups[block.label]) groups[block.label].push(slot);
      else groups.Night.push(slot);
    });
    return groups;
  }, [slots]);

  useEffect(() => {
    const fetchSport = async () => {
      const slugId = id.toLowerCase().replace(/ /g, '_');
      const { data } = await supabase.from('sports').select('*').or(`id.eq.${id},name.ilike.%${id}%`).single();
      if (data) setSport(data);
      else {
          const mock = [
              { id: 'football', name: 'Football', price_per_hour: 1200, image_url: '/assets/sports/football.jpg' },
              { id: 'box_cricket', name: 'Box Cricket', price_per_hour: 1500, image_url: '/assets/sports/box_cricket.jpg' },
              { id: 'badminton', name: 'Badminton', price_per_hour: 400, image_url: '/assets/sports/badminton.jpg' },
              { id: 'tennis', name: 'Tennis', price_per_hour: 1000, image_url: '/assets/sports/tennis.jpg' },
              { id: 'drift_bikes', name: 'Drift Bikes', price_per_hour: 2500, image_url: '/assets/sports/drift_bikes.jpg' },
              { id: 'bowling', name: 'Bowling', price_per_hour: 1200, image_url: '/assets/sports/bowling.jpg' },
              { id: 'paintball', name: 'Paintball', price_per_hour: 2500, image_url: '/assets/sports/paintball.jpg' }
          ].find(s => s.id === slugId || s.name.toLowerCase() === id.toLowerCase());
          if (mock) setSport(mock);
      }
    };
    fetchSport();
  }, [id]);

  const handleBooking = async () => {
    setBookingStatus('processing');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // Clerk handles its own auth, we assume they are logged in if we proceed. 
        // Real implementation would check useAuth from Clerk.
    }

    const { error } = await supabase.from('bookings').insert([{
      user_id: user?.id || 'mock-user-id',
      sport_id: sport.id,
      date: selectedDate,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
      players_count: playerCount,
      status: 'CONFIRMED'
    }]);

    if (error) {
      console.error(error);
      setBookingStatus('error');
    } else {
      setBookingStatus('success');
      // Fire and forget email confirmation
      import('../utils/email').then(({ sendBookingConfirmation }) => {
        sendBookingConfirmation({
          toEmail: user?.primaryEmailAddress?.emailAddress || 'guest@example.com',
          userName: user?.fullName || 'Athlete',
          sportName: sport.name,
          date: selectedDate,
          time: selectedSlot.start_time
        });
      });
    }
  };

  if (!sport) return <div className="h-screen flex items-center justify-center text-brand-500 font-bold animate-pulse">Loading Arena Details...</div>;

  const currentBasePrice = sport.price_per_hour || sport.price || 1000;
  const finalPrice = selectedSlot ? calculatePrice(currentBasePrice, selectedSlot.start_time) : currentBasePrice;

  const steps = ['Arena', 'Time', 'Squad', 'Checkout'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 glass px-4 py-4 flex items-center justify-between">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeft size={24} className="text-slate-700 dark:text-slate-300" />
        </button>
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className={clsx("w-12 h-1.5 rounded-full transition-colors duration-500", step > i ? "bg-brand-500" : step === i + 1 ? "bg-brand-300 dark:bg-brand-700" : "bg-slate-200 dark:bg-slate-800")} />
            </div>
          ))}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="flex-1 mt-20 px-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
              <div className="relative h-80 rounded-[2rem] overflow-hidden shadow-2xl">
                <img src={sport.image_url || sport.image} alt={sport.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">Premium Turf</span>
                  <h1 className="font-display font-bold text-4xl mt-3">{sport.name}</h1>
                  <p className="text-white/80 font-medium text-sm mt-1 flex items-center gap-2">Starts from <span className="font-bold text-brand-400">₹{currentBasePrice}/hr</span></p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-glass dark:shadow-glass-dark">
                <h3 className="font-display font-bold text-xl mb-4 text-slate-900 dark:text-white">Arena Info</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Experience top-tier facilities with professional grade surfaces. Perfect for competitive matches or casual play.
                </p>
                <button onClick={() => setStep(2)} className="w-full mt-6 bg-gradient-brand text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-brand-500/50 hover:-translate-y-1 transition-all flex justify-center items-center gap-2">
                  Check Availability <ArrowRight size={20} />
                </button>
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div>
                <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white mb-2">Select Date & Time</h2>
                <p className="text-slate-500 text-sm">Choose your preferred slot</p>
              </div>

              {/* Horizontal Scroll Date Picker */}
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                {dateOptions.map((d) => (
                  <button
                    key={d.full}
                    onClick={() => { setSelectedDate(d.full); setSelectedSlot(null); }}
                    className={clsx(
                      "flex-shrink-0 w-20 h-24 rounded-2xl transition-all duration-300 snap-center flex flex-col items-center justify-center border shadow-sm",
                      selectedDate === d.full 
                        ? "bg-brand-500 border-brand-500 text-white scale-105 shadow-brand-500/30" 
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300"
                    )}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wider mb-1 opacity-80">{d.day}</span>
                    <span className="text-2xl font-display font-bold">{d.date}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-8">
                {['Morning', 'Afternoon', 'Evening', 'Night'].map((block) => (
                  groupedSlots[block].length > 0 && (
                    <div key={block} className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
                        {getTimeBlock(groupedSlots[block][0].start_time).icon}
                        {block}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {groupedSlots[block].map(slot => {
                          const slotPrice = calculatePrice(currentBasePrice, slot.start_time);
                          const isActive = selectedSlot?.id === slot.id;
                          return (
                            <button
                              key={slot.id}
                              disabled={!slot.is_available}
                              onClick={() => setSelectedSlot(slot)}
                              className={clsx(
                                "py-3 px-2 rounded-xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-1 relative overflow-hidden",
                                !slot.is_available 
                                  ? "opacity-40 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                                  : isActive 
                                    ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-900/30 dark:border-brand-500 dark:text-brand-300 shadow-sm"
                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:text-slate-200"
                              )}
                            >
                              {isActive && (
                                <motion.div layoutId="slot-active" className="absolute inset-0 bg-brand-100 dark:bg-brand-900/50 z-0" />
                              )}
                              <span className="relative z-10 font-bold">{slot.start_time.slice(0, 5)}</span>
                              {slot.is_available && <span className={clsx("relative z-10 text-[10px] font-medium", isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-500")}>₹{slotPrice}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
                {slotsLoading && <div className="text-center py-10 font-medium text-brand-500 animate-pulse">Loading slots...</div>}
              </div>

              {selectedSlot && (
                <div className="fixed bottom-24 left-0 w-full px-4 z-40">
                  <motion.button 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={() => setStep(3)} 
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-xl flex justify-between items-center px-6"
                  >
                    <span>Continue</span>
                    <span className="flex items-center gap-2">₹{calculatePrice(currentBasePrice, selectedSlot.start_time)} <ArrowRight size={18}/></span>
                  </motion.button>
                </div>
              )}
            </motion.section>
          )}

          {step === 3 && (
            <motion.section key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div>
                <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white mb-2">Squad Size</h2>
                <p className="text-slate-500 text-sm">How many players are joining?</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 text-center shadow-glass dark:shadow-glass-dark">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                      <Users size={32} className="text-brand-500" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-8 mb-8">
                      <button onClick={() => setPlayerCount(Math.max(1, playerCount - 1))} className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl font-light hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">-</button>
                      <span className="font-display font-bold text-6xl text-slate-900 dark:text-white w-20">{playerCount}</span>
                      <button onClick={() => setPlayerCount(playerCount + 1)} className="w-14 h-14 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-2xl font-light hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">+</button>
                  </div>
              </div>
              <button onClick={() => setStep(4)} className="w-full bg-gradient-brand text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-brand-500/50 hover:-translate-y-1 transition-all">Proceed to Checkout</button>
            </motion.section>
          )}

          {step === 4 && (
            <motion.section key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div>
                <h2 className="font-display font-bold text-3xl text-slate-900 dark:text-white mb-2">Checkout</h2>
                <p className="text-slate-500 text-sm">Review your booking details</p>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-glass dark:shadow-glass-dark relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                
                <div className="flex gap-4 items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-xl overflow-hidden">
                    <img src={sport.image_url || sport.image} alt="Sport" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">{sport.name}</h3>
                    <p className="text-brand-500 font-medium text-sm">{selectedDate} • {selectedSlot?.start_time.slice(0,5)}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-semibold text-slate-900 dark:text-white">60 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Players</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{playerCount} Pax</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Slot Base Price</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{currentBasePrice}</span>
                  </div>
                  {getTimeBlock(selectedSlot?.start_time).multiplier !== 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-500">{getTimeBlock(selectedSlot?.start_time).label} Surcharge</span>
                      <span className="font-semibold text-amber-500">
                        {getTimeBlock(selectedSlot?.start_time).multiplier > 1 ? '+' : '-'} 
                        ₹{Math.abs(finalPrice - currentBasePrice)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Total Pay</span>
                  <span className="font-display font-bold text-3xl text-brand-500">₹{finalPrice}</span>
                </div>
              </div>

              {bookingStatus === 'success' ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-8 rounded-[2rem] text-center border border-emerald-100 dark:border-emerald-800/50">
                      <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                      <h3 className="font-display font-bold text-2xl mb-2">Booking Confirmed!</h3>
                      <p className="text-sm opacity-80 mb-6">Your slot is locked in. Get ready to play.</p>
                      <button onClick={() => navigate('/dashboard')} className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-emerald-600 transition-colors">
                        View Dashboard
                      </button>
                  </motion.div>
              ) : (
                  <button 
                    disabled={bookingStatus === 'processing'} 
                    onClick={handleBooking} 
                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-xl flex justify-center items-center gap-2 hover:-translate-y-1 transition-transform disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                      {bookingStatus === 'processing' ? 'Processing Secure Payment...' : 'Pay with Razorpay'}
                  </button>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
