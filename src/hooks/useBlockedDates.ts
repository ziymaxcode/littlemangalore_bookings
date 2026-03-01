import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';

export function useBlockedDates(type: 'resort' | 'turf' | 'event') {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockedDates = async () => {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('date')
        .gte('date', today)
        .in('type', ['all', type]);

      if (!error && data) {
        setBlockedDates(data.map(b => b.date));
      }
      setLoading(false);
    };

    fetchBlockedDates();
  }, [type]);

  const isDateBlocked = (dateStr: string) => {
    return blockedDates.includes(dateStr);
  };

  return { blockedDates, isDateBlocked, loading };
}
