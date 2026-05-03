import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { useRealtimeSlots } from '../hooks/useRealtimeSlots';
import { ArrowRight, Sunrise, Sun, Sunset, Moon, Users, CheckCircle2, ChevronLeft } from 'lucide-react';
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
        day: isToday ? 'TODAY' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: d.getDate(),
      };
    });
  }, []);

  const getTimeBlock = (time) => {
    if (!time) return { label: 'UNKNOWN', icon: null, multiplier: 1.0 };
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return { label: 'MORNING', icon: <Sunrise size={20} strokeWidth={3} />, multiplier: 1.0, color: 'bg-pl-yellow' };
    if (hour >= 12 && hour < 16) return { label: 'AFTERNOON', icon: <Sun size={20} strokeWidth={3} />, multiplier: 0.8, color: 'bg-pl-blue' };
    if (hour >= 16 && hour < 20) return { label: 'EVENING', icon: <Sunset size={20} strokeWidth={3} />, multiplier: 1.2, color: 'bg-pl-pink' };
    return { label: 'NIGHT', icon: <Moon size={20} strokeWidth={3} />, multiplier: 1.5, color: 'bg-pl-green' };
  };

  const calculatePrice = (basePrice, time) => {
    const { multiplier } = getTimeBlock(time);
    return Math.round(basePrice * multiplier);
  };

  const groupedSlots = useMemo(() => {
    const groups = { MORNING: [], AFTERNOON: [], EVENING: [], NIGHT: [] };
    slots.forEach(slot => {
      const block = getTimeBlock(slot.start_time);
      if (groups[block.label]) groups[block.label].push(slot);
      else groups.NIGHT.push(slot);
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
              { id: 'football', name: 'FOOTBALL', price_per_hour: 1200, image_url: '/assets/sports/football.jpg' },
              { id: 'box_cricket', name: 'BOX CRICKET', price_per_hour: 1500, image_url: '/assets/sports/box_cricket.jpg' },
              { id: 'badminton', name: 'BADMINTON', price_per_hour: 400, image_url: '/assets/sports/badminton.jpg' },
              { id: 'tennis', name: 'TENNIS', price_per_hour: 1000, image_url: '/assets/sports/tennis.jpg' },
              { id: 'drift_bikes', name: 'DRIFT BIKES', price_per_hour: 2500, image_url: '/assets/sports/drift_bikes.jpg' },
              { id: 'bowling', name: 'BOWLING', price_per_hour: 1200, image_url: '/assets/sports/bowling.jpg' },
              { id: 'paintball', name: 'PAINTBALL', price_per_hour: 2500, image_url: '/assets/sports/paintball.jpg' }
          ].find(s => s.id === slugId || s.name.toLowerCase() === id.toLowerCase());
          if (mock) setSport(mock);
      }
    };
    fetchSport();
  }, [id]);

  const handleBooking = async () => {
    setBookingStatus('processing');
    const { data: { user } } = await supabase.auth.getUser();

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

  if (!sport) return <div className="h-screen flex items-center justify-center font-heavy text-4xl text-foreground uppercase animate-pulse">LOADING ARENA...</div>;

  const currentBasePrice = sport.price_per_hour || sport.price || 1000;
  const finalPrice = selectedSlot ? calculatePrice(currentBasePrice, selectedSlot.start_time) : currentBasePrice;

  const steps = ['ARENA', 'TIME', 'SQUAD', 'PAY'];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28 font-sans">
      {/* Header */}
      <header className="fixed top-0 w-full max-w-[480px] z-50 bg-background border-b-[3px] border-foreground px-4 py-4 flex items-center justify-between">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="p-2 border-2 border-foreground rounded-full hover:bg-foreground hover:text-background transition-colors">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-heavy text-2xl uppercase tracking-widest">{steps[step-1]}</span>
          <div className="flex gap-1 mt-1">
            {steps.map((_, i) => (
              <div key={i} className={clsx("h-2 rounded-full border-2 border-foreground transition-all duration-300", step > i ? "w-6 bg-pl-brand" : "w-2 bg-transparent")} />
            ))}
          </div>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 mt-24 px-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.section key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="relative h-80 rounded-[2rem] overflow-hidden border-[3px] border-foreground shadow-pl-solid">
                <img src={sport.image_url || sport.image} alt={sport.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="bg-pl-brand text-white px-3 py-1 font-bold text-[10px] uppercase tracking-widest border-2 border-foreground">PREMIUM TURF</span>
                  <h1 className="font-heavy text-6xl mt-2 leading-none uppercase">{sport.name}</h1>
                  <p className="font-sans font-bold text-sm uppercase tracking-widest mt-2">STARTS AT ₹{currentBasePrice}/HR</p>
                </div>
              </div>
              <div className="bg-pl-yellow rounded-[2rem] p-6 border-[3px] border-foreground shadow-pl-solid">
                <h3 className="font-heavy text-3xl mb-2 uppercase">ARENA DETAILS</h3>
                <p className="font-sans font-bold text-sm text-foreground/80 leading-relaxed uppercase tracking-wider">
                  EXPERIENCE TOP-TIER FACILITIES WITH PROFESSIONAL GRADE SURFACES. PERFECT FOR COMPETITIVE MATCHES OR CASUAL PLAY.
                </p>
                <button onClick={() => setStep(2)} className="w-full mt-6 bg-foreground text-background font-heavy text-2xl tracking-wider py-4 border-[3px] border-foreground hover:bg-white hover:text-foreground transition-colors shadow-[4px_4px_0px_rgba(255,255,255,1)]">
                  CHECK AVAILABILITY
                </button>
              </div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
              <div>
                <h2 className="font-heavy text-5xl uppercase leading-none">SELECT TIME</h2>
                <p className="font-sans font-bold text-xs tracking-widest uppercase mt-1 text-foreground/60">CHOOSE YOUR PREFERRED SLOT</p>
              </div>

              {/* Horizontal Scroll Date Picker */}
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                {dateOptions.map((d) => (
                  <button
                    key={d.full}
                    onClick={() => { setSelectedDate(d.full); setSelectedSlot(null); }}
                    className={clsx(
                      "flex-shrink-0 w-24 h-28 rounded-2xl transition-all duration-200 snap-center flex flex-col items-center justify-center border-[3px] border-foreground",
                      selectedDate === d.full 
                        ? "bg-pl-brand text-white shadow-pl-solid -translate-y-1" 
                        : "bg-white text-foreground hover:bg-slate-100"
                    )}
                  >
                    <span className="font-sans font-bold text-[10px] tracking-widest">{d.day}</span>
                    <span className="font-heavy text-5xl mt-1">{d.date}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6 pb-20">
                {['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'].map((block) => {
                  const blockColor = getTimeBlock('06:00').color; // Just fetching a color var
                  let bgCol = 'bg-white';
                  if(block === 'MORNING') bgCol = 'bg-pl-yellow';
                  if(block === 'AFTERNOON') bgCol = 'bg-pl-blue';
                  if(block === 'EVENING') bgCol = 'bg-pl-pink';
                  if(block === 'NIGHT') bgCol = 'bg-pl-green';

                  return groupedSlots[block].length > 0 && (
                    <div key={block} className={clsx("rounded-[2rem] p-5 border-[3px] border-foreground shadow-pl-solid", bgCol)}>
                      <div className="flex items-center gap-2 font-heavy text-2xl uppercase mb-4">
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
                                "py-3 rounded-xl border-[3px] border-foreground text-center transition-all flex flex-col items-center justify-center relative",
                                !slot.is_available 
                                  ? "opacity-50 bg-white/50 cursor-not-allowed"
                                  : isActive 
                                    ? "bg-foreground text-background shadow-[2px_2px_0px_white]"
                                    : "bg-white hover:-translate-y-1 hover:shadow-pl-solid"
                              )}
                            >
                              <span className="font-heavy text-2xl leading-none">{slot.start_time.slice(0, 5)}</span>
                              {slot.is_available && <span className="font-sans font-bold text-[10px] uppercase mt-1 tracking-widest">₹{slotPrice}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
                })}
                {slotsLoading && <div className="text-center py-10 font-heavy text-2xl animate-pulse">LOADING SLOTS...</div>}
              </div>

              {selectedSlot && (
                <div className="fixed bottom-0 w-full max-w-[480px] px-4 py-4 bg-background border-t-[3px] border-foreground z-40 flex gap-4">
                  <div className="flex-1">
                    <span className="font-sans font-bold text-[10px] tracking-widest uppercase">TOTAL</span>
                    <div className="font-heavy text-3xl leading-none">₹{calculatePrice(currentBasePrice, selectedSlot.start_time)}</div>
                  </div>
                  <button 
                    onClick={() => setStep(3)} 
                    className="flex-[2] bg-pl-brand text-white border-[3px] border-foreground font-heavy text-2xl py-3 shadow-pl-solid hover:bg-white hover:text-foreground hover:shadow-none transition-all flex justify-center items-center gap-2"
                  >
                    CONTINUE <ArrowRight size={24} strokeWidth={3} />
                  </button>
                </div>
              )}
            </motion.section>
          )}

          {step === 3 && (
            <motion.section key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
              <div>
                <h2 className="font-heavy text-5xl uppercase leading-none">SQUAD SIZE</h2>
                <p className="font-sans font-bold text-xs tracking-widest uppercase mt-1 text-foreground/60">HOW MANY PLAYERS?</p>
              </div>
              <div className="bg-pl-blue rounded-[2rem] p-8 text-center border-[3px] border-foreground shadow-pl-solid">
                  <div className="flex items-center justify-center gap-8 py-8">
                      <button onClick={() => setPlayerCount(Math.max(1, playerCount - 1))} className="w-16 h-16 rounded-full border-[3px] border-foreground bg-white flex items-center justify-center font-heavy text-4xl shadow-pl-solid hover:-translate-y-1 transition-all">-</button>
                      <span className="font-heavy text-8xl w-24 leading-none">{playerCount}</span>
                      <button onClick={() => setPlayerCount(playerCount + 1)} className="w-16 h-16 rounded-full border-[3px] border-foreground bg-white flex items-center justify-center font-heavy text-4xl shadow-pl-solid hover:-translate-y-1 transition-all">+</button>
                  </div>
              </div>
              <button onClick={() => setStep(4)} className="w-full bg-pl-brand text-white border-[3px] border-foreground font-heavy text-3xl py-5 shadow-pl-solid hover:-translate-y-1 transition-all">PROCEED TO PAY</button>
            </motion.section>
          )}

          {step === 4 && (
            <motion.section key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="font-heavy text-5xl uppercase leading-none">CHECKOUT</h2>
                <p className="font-sans font-bold text-xs tracking-widest uppercase mt-1 text-foreground/60">REVIEW DETAILS</p>
              </div>
              
              <div className="bg-white rounded-[2rem] p-6 border-[3px] border-foreground shadow-pl-solid relative overflow-hidden">
                <div className="flex gap-4 items-center mb-6 pb-6 border-b-[3px] border-foreground">
                  <div className="w-20 h-20 border-[3px] border-foreground rounded-xl overflow-hidden">
                    <img src={sport.image_url || sport.image} alt="Sport" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-heavy text-3xl uppercase leading-none mb-1">{sport.name}</h3>
                    <p className="font-sans font-bold text-xs tracking-widest">{selectedDate} • {selectedSlot?.start_time.slice(0,5)}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6 font-sans font-bold text-sm tracking-widest uppercase">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">DURATION</span>
                    <span>60 MINS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">PLAYERS</span>
                    <span>{playerCount} PAX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">BASE PRICE</span>
                    <span>₹{currentBasePrice}</span>
                  </div>
                  {getTimeBlock(selectedSlot?.start_time).multiplier !== 1 && (
                    <div className="flex justify-between">
                      <span className="text-pl-brand">{getTimeBlock(selectedSlot?.start_time).label} SURCHARGE</span>
                      <span className="text-pl-brand">
                        {getTimeBlock(selectedSlot?.start_time).multiplier > 1 ? '+' : '-'} 
                        ₹{Math.abs(finalPrice - currentBasePrice)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t-[3px] border-foreground flex justify-between items-center">
                  <span className="font-heavy text-2xl uppercase">TOTAL PAY</span>
                  <span className="font-heavy text-4xl text-pl-brand">₹{finalPrice}</span>
                </div>
              </div>

              {bookingStatus === 'success' ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-pl-green border-[3px] border-foreground p-8 rounded-[2rem] text-center shadow-pl-solid">
                      <CheckCircle2 size={64} className="mx-auto mb-4 text-foreground" strokeWidth={3} />
                      <h3 className="font-heavy text-4xl uppercase mb-2">BOOKING CONFIRMED</h3>
                      <p className="font-sans font-bold text-xs tracking-widest uppercase mb-6 opacity-80">YOUR SLOT IS LOCKED. GET READY TO PLAY.</p>
                      <button onClick={() => navigate('/dashboard')} className="w-full bg-foreground text-background border-[3px] border-foreground font-heavy text-2xl py-4 shadow-[4px_4px_0px_white]">
                        VIEW DASHBOARD
                      </button>
                  </motion.div>
              ) : (
                  <button 
                    disabled={bookingStatus === 'processing'} 
                    onClick={handleBooking} 
                    className="w-full bg-foreground text-background border-[3px] border-foreground font-heavy text-3xl py-5 shadow-pl-solid hover:bg-white hover:text-foreground transition-all disabled:opacity-70 flex justify-center items-center"
                  >
                      {bookingStatus === 'processing' ? 'PROCESSING...' : 'PAY NOW'}
                  </button>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
