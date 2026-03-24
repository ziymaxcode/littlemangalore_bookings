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

const OWNER_PHONE = '918217366801';
const UPI_ID = '8217366801@superyes'; // Placeholder UPI ID
const UPI_NAME = 'Little Mangalore';

export const ADVANCE_AMOUNTS = {
  resort: 500,
  turf: 200,
  event: 1000,
};

export async function submitBooking(data: BookingData) {
  try {
    // 1. Check for Blocked Date
    const { data: blocked, error: blockedError } = await supabase
      .from('blocked_dates')
      .select('reason')
      .eq('date', data.date)
      .maybeSingle();

    // 🚩 IF BLOCKED, STOP AND RETURN IMMEDIATELY
    if (blocked) {
      console.log("Date is blocked, stopping execution.");
      return { 
        success: false, 
        message: `This date is unavailable. Reason: ${blocked.reason || 'Management Block'}` 
      };
    }

    // 2. Fix the 'guests' null constraint (DB requires a value)
    const guestsCount = data.guests ?? (data.type === 'turf' ? 0 : 1);

    // 3. Insert into Supabase
    const { data: insertedBooking, error: insertError } = await supabase
      .from('bookings')
      .insert([
        {
          type: data.type,
          name: data.name,
          phone: data.phone,
          date: data.date,
          time_slot: data.time_slot || null,
          event_type: data.event_type || null,
          room_type: data.room_type || null,
          guests: guestsCount, 
          payment_method: data.payment_method,
          notes: data.notes || null,
          status: data.payment_method === 'upi' ? 'paid' : 'pending',
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 4. Generate Reference and Links
    const bookingRef = insertedBooking.id.split('-')[0].toUpperCase();
    const waUrl = generateWhatsAppLink(data, bookingRef);

    if (data.payment_method === 'upi') {
      const amount = ADVANCE_AMOUNTS[data.type];
      const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&tn=BookingRef${bookingRef}`;
      return { success: true, ref: bookingRef, upiUrl, waUrl };
    }

    return { success: true, ref: bookingRef, waUrl };

  } catch (error: any) {
    console.error("Booking Logic Error:", error);
    return { 
      success: false, 
      message: error.message || 'Failed to submit booking. Please try again.' 
    };
  }
}
function formatSlot(slot?: string) {
  if (!slot) return "";

  const [start, end] = slot.split("-").map(Number);

  const formatHour = (h: number) => {
    const hour = h % 24;
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 === 0 ? 12 : hour % 12;
    return `${display} ${period}`;
  };

  return `${formatHour(start)} - ${formatHour(end)}`;
}

function generateWhatsAppLink(data: BookingData, ref: string) {
  const text = `New Booking Alert! 🔔
Ref: ${ref}
Name: ${data.name}
Type: ${data.type.toUpperCase()}
Date: ${data.date}
${data.time_slot ? `Slot: ${formatSlot(data.time_slot)}\n` : ''}${data.room_type ? `Room: ${data.room_type}\n` : ''}${data.event_type ? `Event: ${data.event_type}\n` : ''}Guests: ${data.guests || 'N/A'}
Payment: ${data.payment_method === 'upi' ? 'UPI (Paid via QR)' : 'Pay at Venue'}
Phone: ${data.phone}
Admin confirmation at: https://littlemangalore.vercel.app/admin/login
${data.notes ? `Notes: ${data.notes}` : ''}`;

  return `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(text)}`;
}