import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Select } from '@/src/components/ui/select';

export default function AdminPanel() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
    } else {
      alert('Failed to update status');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface">
      <header className="bg-primary text-white py-4 px-6 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-serif font-bold">Admin Dashboard</h1>
          <p className="text-primary-light text-xs">Little Mangalore</p>
        </div>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={fetchBookings}>
          Refresh
        </Button>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {loading ? (
          <p className="text-center text-text-muted mt-10">Loading bookings...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-primary/10 text-sm text-text-muted">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Phone</th>
                  <th className="p-3 font-medium">Details</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                    <td className="p-3 text-sm whitespace-nowrap">
                      {new Date(booking.date).toLocaleDateString()}
                      <div className="text-xs text-text-muted mt-1">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary capitalize">
                        {booking.type}
                      </span>
                    </td>
                    <td className="p-3 text-sm font-medium">{booking.name}</td>
                    <td className="p-3 text-sm">{booking.phone}</td>
                    <td className="p-3 text-sm text-text-muted max-w-xs truncate">
                      {booking.type === 'turf' && booking.time_slot}
                      {booking.type === 'resort' && booking.room_type}
                      {booking.type === 'event' && booking.event_type}
                    </td>
                    <td className="p-3">
                      <Select 
                        value={booking.status} 
                        onChange={(e) => updateStatus(booking.id, e.target.value)}
                        className="h-9 text-xs py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="paid">Paid</option>
                      </Select>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-text-muted">No bookings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
