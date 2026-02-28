import { supabase } from './supabase';

export type BookingType = 'resort' | 'turf' | 'event';
export type PaymentMethod = 'upi' | 'venue';
export type BookingStatus = 'pending' | 'confirmed' | 'paid';

export interface BookingData {
  type: BookingType;
  name: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time_slot?: string;
  room_type?: string;
  event_type?: string;
  guests?: number;
  payment_method: PaymentMethod;
  notes?: string;
}

const OWNER_PHONE = '918050006565';
const UPI_ID = 'littlemangalore@upi'; // Placeholder UPI ID
const UPI_NAME = 'Little Mangalore';

export const ADVANCE_AMOUNTS = {
  resort: 500,
  turf: 200,
  event: 1000,
};

export async function submitBooking(data: BookingData) {
  try {
    // 1. Insert into Supabase
    const { data: insertedBooking, error } = await supabase
      .from('bookings')
      .insert([
        {
          ...data,
          status: data.payment_method === 'upi' ? 'paid' : 'pending', // Simplified: assume UPI is paid immediately for this demo if they select UPI. In reality, we'd verify Razorpay callback.
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const bookingRef = insertedBooking.id.split('-')[0].toUpperCase();

    // 2. Handle Payment / WhatsApp
    if (data.payment_method === 'upi') {
      // Generate UPI Intent Link
      const amount = ADVANCE_AMOUNTS[data.type];
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&tn=BookingRef${bookingRef}`;
      
      // In a real app, we'd redirect to UPI app, then on return, redirect to WhatsApp.
      // For web, we might just open the UPI link, and also open WhatsApp.
      // Here we'll just return the UPI link and WhatsApp link to the component to handle.
      return { success: true, ref: bookingRef, upiUrl, waUrl: generateWhatsAppLink(data, bookingRef) };
    } else {
      // Pay at Venue -> Direct to WhatsApp
      return { success: true, ref: bookingRef, waUrl: generateWhatsAppLink(data, bookingRef) };
    }
  } catch (error) {
    console.error('Booking error:', error);
    return { success: false, error };
  }
}

function generateWhatsAppLink(data: BookingData, ref: string) {
  const text = `New Booking Alert! 🔔
Ref: ${ref}
Name: ${data.name}
Type: ${data.type.toUpperCase()}
Date: ${data.date}
${data.time_slot ? `Slot: ${data.time_slot}\n` : ''}${data.room_type ? `Room: ${data.room_type}\n` : ''}${data.event_type ? `Event: ${data.event_type}\n` : ''}Guests: ${data.guests || 'N/A'}
Payment: ${data.payment_method === 'upi' ? 'UPI (Paid)' : 'Pay at Venue'}
Phone: ${data.phone}
${data.notes ? `Notes: ${data.notes}` : ''}`;

  return `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(text)}`;
}
