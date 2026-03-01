import React, { useEffect, useState } from 'react';
import AdminLayout from '@/src/components/admin/AdminLayout';
import { supabase } from '@/src/lib/supabase';
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  IndianRupee,
  Search,
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  XCircle,
  MessageCircle,
  Eye
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { format, parseISO } from 'date-fns';

interface Booking {
  id: string;
  created_at: string;
  type: string;
  name: string;
  phone: string;
  date: string;
  time_slot?: string;
  room_type?: string;
  event_type?: string;
  guests?: number;
  payment_method: string;
  status: string;
  notes?: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    revenue: 0,
  });

  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      calculateStats(data);
    }
    setLoading(false);
  };

  const calculateStats = (data: Booking[]) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const total = data.length;
    const todayBookings = data.filter(b => b.date === today).length;
    const pending = data.filter(b => b.status === 'pending').length;
    
    // Calculate revenue (simplified: assuming all paid bookings have a fixed advance amount based on type)
    const ADVANCE_AMOUNTS: Record<string, number> = { resort: 500, turf: 200, event: 1000 };
    const revenue = data
      .filter(b => b.status === 'paid' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (ADVANCE_AMOUNTS[b.type] || 0), 0);

    setStats({ total, today: todayBookings, pending, revenue });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      const updatedBookings = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
      setBookings(updatedBookings);
      calculateStats(updatedBookings);
      // In a real app, show a toast notification here
    } else {
      alert('Failed to update status');
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchType = filterType === 'all' || b.type === filterType;
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        b.phone.includes(searchQuery);
    return matchType && matchStatus && matchSearch;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Type', 'Date', 'Time/Room', 'Guests', 'Payment', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredBookings.map(b => [
        b.id.split('-')[0],
        `"${b.name}"`,
        `"${b.phone}"`,
        b.type,
        b.date,
        `"${b.time_slot || b.room_type || b.event_type || ''}"`,
        b.guests || '',
        b.payment_method,
        b.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bookings_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200 line-through opacity-70';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Bookings" 
            value={stats.total.toString()} 
            icon={<Users className="w-6 h-6 text-[#2D9D78]" />} 
          />
          <StatCard 
            title="Today's Bookings" 
            value={stats.today.toString()} 
            icon={<CalendarCheck className="w-6 h-6 text-[#2D9D78]" />} 
          />
          <StatCard 
            title="Pending Confirmations" 
            value={stats.pending.toString()} 
            icon={<Clock className="w-6 h-6 text-yellow-500" />} 
          />
          <StatCard 
            title="Revenue Collected" 
            value={`₹${stats.revenue.toLocaleString()}`} 
            icon={<IndianRupee className="w-6 h-6 text-[#2D9D78]" />} 
          />
        </div>

        {/* Filters & Actions */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#2D9D78] focus:border-[#2D9D78] w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#2D9D78] focus:border-[#2D9D78]"
            >
              <option value="all">All Types</option>
              <option value="resort">Resort</option>
              <option value="turf">Turf</option>
              <option value="event">Event</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#2D9D78] focus:border-[#2D9D78]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm font-medium hover:bg-[#2D9D78] transition-colors w-full sm:w-auto justify-center"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D9D78]"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No bookings found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className={cn("hover:bg-gray-50 transition-colors", booking.status === 'cancelled' && "opacity-60")}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {booking.id.split('-')[0].toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                        <div className="text-sm text-gray-500">{booking.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize font-medium">{booking.type}</div>
                        <div className="text-sm text-gray-500">
                          {format(parseISO(booking.date), 'MMM d, yyyy')}
                          {booking.time_slot && ` • ${booking.time_slot}`}
                          {booking.room_type && ` • ${booking.room_type}`}
                          {booking.event_type && ` • ${booking.event_type}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 uppercase">
                          {booking.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn("px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border", getStatusColor(booking.status))}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status !== 'confirmed' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => updateStatus(booking.id, 'confirmed')}
                              title="Confirm Booking"
                              className="text-green-600 hover:text-green-900 bg-green-50 p-1.5 rounded-md hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status !== 'paid' && booking.status !== 'cancelled' && (
                            <button
                              onClick={() => updateStatus(booking.id, 'paid')}
                              title="Mark as Paid"
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              <IndianRupee className="w-4 h-4" />
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => updateStatus(booking.id, 'cancelled')}
                              title="Cancel Booking"
                              className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <a
                            href={`https://wa.me/${booking.phone}?text=Hi ${booking.name}, regarding your booking at Little Mangalore...`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Message on WhatsApp"
                            className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 p-1.5 rounded-md hover:bg-emerald-100 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-[#F9F6F0] rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
