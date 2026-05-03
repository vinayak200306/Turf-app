import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const sportsData = {
  cricket: { name: 'Box Cricket', price: 1500, image: '/assets/sports/box_cricket.jpg' },
  football: { name: 'Football', price: 2000, image: '/assets/sports/football.jpg' },
  tennis: { name: 'Tennis', price: 1000, image: '/assets/sports/tennis.jpg' },
  badminton: { name: 'Badminton', price: 800, image: '/assets/sports/badminton.jpg' },
  drift_bikes: { name: 'Drift Bikes', price: 2500, image: '/assets/sports/drift_bikes.jpg' },
  paintball: { name: 'Paintball', price: 3000, image: '/assets/sports/paintball.jpg' },
  bowling: { name: 'Bowling', price: 1200, image: '/assets/sports/bowling.jpg' },
};

const slots = [
  '06:00 AM - 07:00 AM',
  '07:00 AM - 08:00 AM',
  '06:00 PM - 07:00 PM',
  '07:00 PM - 08:00 PM',
  '08:00 PM - 09:00 PM'
];

export default function SportDetail() {
  const { id } = useParams();
  const sport = sportsData[id] || sportsData.football;

  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative h-[60vh] w-full flex flex-col items-center justify-center text-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 parallax-bg grayscale"
          style={{ backgroundImage: `url('${sport.image}')` }}
        />
        <div className="absolute inset-0 bg-black/70 z-10" />
        <div className="relative z-20 px-4 max-w-6xl">
          <h2 className="font-headline font-black text-6xl md:text-8xl text-primary tracking-tighter uppercase mb-4 glitch-hover-effect" data-text={sport.name}>
            {sport.name}
          </h2>
          <p className="font-body font-bold text-2xl text-white uppercase">
            ₹{sport.price} <span className="text-on-surface-variant text-lg">/ HOUR</span>
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="bg-surface-container-low border-4 border-outline p-8 md:p-16">
          <h3 className="font-headline font-black text-4xl text-white uppercase mb-12">SECURE YOUR <span className="text-secondary">SLOT</span></h3>
          
          <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); alert('Booking logic to be hooked to Supabase'); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block font-headline font-bold text-on-surface-variant uppercase mb-2">DATE</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0e0e0e] text-white border-2 border-outline focus:border-secondary transition-none p-4 font-body" 
                  required
                />
              </div>
              <div>
                <label className="block font-headline font-bold text-on-surface-variant uppercase mb-2">PLAYERS</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full bg-[#0e0e0e] text-white border-2 border-outline focus:border-secondary transition-none p-4 font-body" 
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-headline font-bold text-on-surface-variant uppercase mb-4 mt-8">AVAILABLE SLOTS</label>
              <div className="flex flex-wrap gap-4">
                {slots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-6 py-3 border-2 font-bold uppercase transition-none ${selectedSlot === slot ? 'bg-primary border-primary text-black' : 'bg-surface border-outline text-white hover:border-white'}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t-2 border-outline">
              <button type="submit" className="w-full bg-primary text-black font-black text-2xl px-12 py-6 outline outline-4 outline-primary hover:bg-white hover:outline-white transition-none active:scale-[0.98]">
                CONFIRM RESERVATION
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
