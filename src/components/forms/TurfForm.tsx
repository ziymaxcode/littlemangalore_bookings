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
import QRCode from "react-qr-code";

const generateTimeSlots = () => {
  const slots = [];
  let start = 7; // 7 AM
  const end = 26; // 2 AM next day (24 + 2)

  const formatHour = (h: number) => {
    const hour = h % 24;
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display} ${period}`;
  };

  for (let i = start; i < end; i++) {
    const label = `${formatHour(i)} - ${formatHour(i + 1)}`;
    const value = `${i % 24}-${(i + 1) % 24}`;
    slots.push({ label, value });
  }

  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// 👉 Replace this with your actual business UPI ID
const MY_UPI_ID = "8217366801@superyes"; 

export default function TurfForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // 👉 Added state to track payment method changes in real-time
  const [paymentMethod, setPaymentMethod] = useState<'venue' | 'upi'>('venue');
  
  const { isDateBlocked } = useBlockedDates('turf');
  
  // Inside TurfForm.tsx
useEffect(() => {
  if (selectedDate) {
    // 🚩 Check if the date is blocked IMMEDIATELY
    if (isDateBlocked(selectedDate)) {
      alert('This date is currently unavailable. Please select another date.');
      setSelectedDate(''); // Reset the date picker
      setSelectedSlot(''); // Reset any selected slot
      setBookedSlots([]);
      return; // Stop execution here
    }

    // If not blocked, proceed to fetch time slots
    fetchBookedSlots(selectedDate);
  }
}, [selectedDate, isDateBlocked]);

  const fetchBookedSlots = async (date: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('type', 'turf')
      .eq('date', date)
      .not('status', 'eq', 'cancelled');

    if (!error && data) {
      setBookedSlots(data.map(b => b.time_slot?.trim()));
    }
  };
const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const date = e.target.value;
  if (isDateBlocked(date)) {
    alert('This date is currently unavailable. Please select another date.');
    setSelectedDate('');
    setSelectedSlot('');
    setBookedSlots([]);
  } else {
    setSelectedDate(date);
  }
};
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedSlot) {
      alert('Please select a time slot.');
      return;
    }

    setLoading(true);

    // 🔴 Check if slot already booked
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('type', 'turf')
      .eq('date', selectedDate)
      .eq('time_slot', selectedSlot)
      .not('status', 'eq', 'cancelled');

    if (existing && existing.length > 0) {
      alert('This time slot has already been booked.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.target as HTMLFormElement);

    const data = {
      type: 'turf' as const,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      date: selectedDate,
      time_slot: selectedSlot,
      event_type: formData.get('sport_type') as string,
      payment_method: paymentMethod,
    };
    
    const res = await submitBooking(data);
    setLoading(false);

    if (res.success) {
  fetchBookedSlots(selectedDate);
  setSuccess(res);
  setTimeout(() => window.open(res.waUrl, '_blank'), 2000);
} else {
  // 🟢 This will now show "This date is unavailable. Reason: event"
  alert(res.message || 'Failed to submit booking. Please try again.');
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

  // 👉 The UPI link format requires specific parameters to open properly in GPay/PhonePe
  const upiLink = `upi://pay?pa=${MY_UPI_ID}&pn=Little%20Mangalore&am=${ADVANCE_AMOUNTS.turf}&cu=INR`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required placeholder="" />
        </div>
        <div>
          <Label htmlFor="phone">Contact Number</Label>
          <Input id="phone" name="phone" type="tel" required placeholder="" />
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
            onChange={handleDateChange}
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
        {/* 👉 Tied Select to paymentMethod state */}
        <Select 
          id="payment_method" 
          name="payment_method" 
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as 'venue' | 'upi')}
          required
        >
          <option value="venue">Pay at Venue</option>
          <option value="upi">UPI (₹{ADVANCE_AMOUNTS.turf} Advance)</option>
        </Select>
      </div>

      {/* 👉 Conditionally render the QR Code in a neat box matching your UI */}
      {paymentMethod === 'upi' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col items-center justify-center p-6 border border-primary/20 rounded-xl bg-surface/50 space-y-4"
        >
          <p className="text-sm text-center font-medium">
            Scan to pay ₹{ADVANCE_AMOUNTS.turf} advance
          </p>
          <div className="bg-white p-3 rounded-xl shadow-sm">
            <QRCode value={upiLink} size={160} />
          </div>
          <p className="text-xs text-text-muted text-center max-w-[250px]">
            Please complete the payment using any UPI app, then click Request Booking below to confirm and attach payment screenshot in the chat.
          </p>
        </motion.div>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={loading || !selectedSlot}>
        {loading ? 'Processing...' : (paymentMethod === 'upi' ? 'I have Paid, Request Booking' : 'Request Booking')}
      </Button>
    </form>
  );
}