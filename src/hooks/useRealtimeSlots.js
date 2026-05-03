import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useRealtimeSlots(sportId, date) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sportId || !date) return;

    const fetchSlots = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('slots')
        .select('*')
        .eq('sport_id', sportId)
        .eq('date', date)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching slots:', error);
      } else {
        setSlots(data);
      }
      setLoading(false);
    };

    fetchSlots();

    // Subscribe to changes in the slots table
    const subscription = supabase
      .channel('slots-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'slots',
          filter: `sport_id=eq.${sportId} AND date=eq.${date}`,
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          if (payload.eventType === 'UPDATE') {
            setSlots((current) =>
              current.map((slot) => (slot.id === payload.new.id ? payload.new : slot))
            );
          } else if (payload.eventType === 'INSERT') {
            setSlots((current) => [...current, payload.new].sort((a,b) => a.start_time.localeCompare(b.start_time)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [sportId, date]);

  return { slots, loading };
}
