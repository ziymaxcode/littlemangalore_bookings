import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { submitBooking, ADVANCE_AMOUNTS } from '@/src/lib/booking';
import { supabase } from '@/src/lib/supabase';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useBlockedDates } from '@/src/hooks/useBlockedDates';

const TIME_SLOTS = [
  { label: 'Morning (6 AM - 9 AM)', value: '6AM-9AM' },
  { label: 'Daytime (9 AM - 5 PM)', value: '9AM-5PM' },
  { label: 'Evening (5 PM - 9 PM)', value: '5PM-9PM' },
  { label: 'Night (9 PM - 12 AM)', value: '9PM-12AM' },
];

export default function TurfForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const { isDateBlocked } = useBlockedDates('turf');

  useEffect(() => {
    if (selectedDate) {
      if (isDateBlocked(selectedDate)) {
        alert('This date is currently unavailable. Please select another date.');
        setSelectedDate('');
        setBookedSlots([]);
      } else {
        fetchBookedSlots(selectedDate);
      }
    }
  }, [selectedDate, isDateBlocked]);

  const fetchBookedSlots = async (date: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('type', 'turf')
      .eq('date', date)
      .in('status', ['confirmed', 'paid']);

    if (!error && data) {
      setBookedSlots(data.map(b => b.time_slot));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert('Please select a time slot.');
      return;
    }
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: 'turf' as const,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      date: selectedDate,
      time_slot: selectedSlot,
      event_type: formData.get('sport_type') as string, // Using event_type for sport
      payment_method: formData.get('payment_method') as 'upi' | 'venue',
    };

    const res = await submitBooking(data);
    setLoading(false);

    if (res.success) {
      setSuccess(res);
      if (res.upiUrl) {
        window.location.href = res.upiUrl;
        setTimeout(() => window.open(res.waUrl, '_blank'), 2000);
      } else {
        window.open(res.waUrl, '_blank');
      }
    } else {
      alert('Failed to submit booking. Please try again.');
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
        <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-serif text-primary mb-2">Booking Requested!</h2>
        <p className="text-text-muted mb-6">Your booking reference is <strong className="text-primary">{success.ref}</strong>.</p>
        <p className="text-sm text-text-muted bg-primary/5 p-4 rounded-xl">Your booking request has been sent to the owner via WhatsApp. You'll receive confirmation shortly.</p>
        <Button className="mt-6 w-full" onClick={() => { setSuccess(null); setSelectedDate(''); setSelectedSlot(''); }}>Book Another</Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required placeholder="John Doe" />
        </div>
        <div>
          <Label htmlFor="phone">Contact Number</Label>
          <Input id="phone" name="phone" type="tel" required placeholder="+91 9876543210" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            name="date" 
            type="date" 
            required 
            min={new Date().toISOString().split('T')[0]} 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="sport_type">Sport Type</Label>
          <Select id="sport_type" name="sport_type" required>
            <option value="Football">Football</option>
            <option value="Cricket">Cricket</option>
          </Select>
        </div>
      </div>

      {selectedDate && (
        <div className="space-y-3">
          <Label>Time Slot</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIME_SLOTS.map((slot) => {
              const isBooked = bookedSlots.includes(slot.value);
              return (
                <button
                  key={slot.value}
                  type="button"
                  disabled={isBooked}
                  onClick={() => setSelectedSlot(slot.value)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                    isBooked 
                      ? "bg-surface/50 border-primary/10 opacity-50 cursor-not-allowed" 
                      : selectedSlot === slot.value
                        ? "bg-primary/5 border-primary text-primary"
                        : "bg-surface border-primary/20 hover:border-primary/50"
                  )}
                >
                  <span className="text-sm font-medium">{slot.label}</span>
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full",
                    isBooked ? "bg-red-500" : "bg-green-500"
                  )} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="payment_method">Payment Method</Label>
        <Select id="payment_method" name="payment_method" required>
          <option value="venue">Pay at Venue</option>
          <option value="upi">UPI (₹{ADVANCE_AMOUNTS.turf} Advance)</option>
        </Select>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading || !selectedSlot}>
        {loading ? 'Processing...' : 'Request Booking'}
      </Button>
    </form>
  );
}
