import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { submitBooking, ADVANCE_AMOUNTS } from '@/src/lib/booking';
import { motion } from 'motion/react';
import { useBlockedDates } from '@/src/hooks/useBlockedDates';

export default function ResortForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const { isDateBlocked } = useBlockedDates('resort');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (isDateBlocked(date)) {
      alert('This date is currently unavailable. Please select another date.');
      setSelectedDate('');
    } else {
      setSelectedDate(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      type: 'resort' as const,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      date: formData.get('date') as string,
      guests: Number(formData.get('guests')),
      room_type: formData.get('room_type') as string,
      notes: formData.get('notes') as string,
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
        <Button className="mt-6 w-full" onClick={() => setSuccess(null)}>Book Another</Button>
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
          <Label htmlFor="date">Date of Stay</Label>
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
          <Label htmlFor="guests">Number of Guests</Label>
          <Input id="guests" name="guests" type="number" min="1" required placeholder="2" />
        </div>
      </div>

      <div>
        <Label htmlFor="room_type">Room Type</Label>
        <Select id="room_type" name="room_type" required>
          <option value="Standard">Standard Room</option>
          <option value="Deluxe">Deluxe Room</option>
          <option value="Premium Suite">Premium Suite</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Special Requests</Label>
        <Textarea id="notes" name="notes" placeholder="Any special requirements..." />
      </div>

      <div>
        <Label htmlFor="payment_method">Payment Method</Label>
        <Select id="payment_method" name="payment_method" required>
          <option value="venue">Pay at Venue</option>
          <option value="upi">UPI (₹{ADVANCE_AMOUNTS.resort} Advance)</option>
        </Select>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? 'Processing...' : 'Request Booking'}
      </Button>
    </form>
  );
}
