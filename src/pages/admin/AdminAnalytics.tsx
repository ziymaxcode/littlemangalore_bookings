import React, { useEffect, useState } from 'react';
import AdminLayout from '@/src/components/admin/AdminLayout';
import { supabase } from '@/src/lib/supabase';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { format, subMonths, parseISO, startOfMonth, endOfMonth } from 'date-fns';

interface Booking {
  id: string;
  type: string;
  status: string;
  date: string;
  payment_method: string;
}

const COLORS = ['#1B4332', '#2D9D78', '#F2C94C', '#EB5757', '#2F80ED'];

export default function AdminAnalytics() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch last 6 months of data
    const sixMonthsAgo = format(subMonths(new Date(), 6), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('bookings')
      .select('id, type, status, date, payment_method')
      .gte('date', sixMonthsAgo);

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  };

  // 1. Bookings by Type (Pie Chart)
  const typeData = [
    { name: 'Resort', value: bookings.filter(b => b.type === 'resort').length },
    { name: 'Turf', value: bookings.filter(b => b.type === 'turf').length },
    { name: 'Event', value: bookings.filter(b => b.type === 'event').length },
  ].filter(d => d.value > 0);

  // 2. Bookings per Month (Bar Chart)
  const getMonthlyData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      months.push({
        name: format(d, 'MMM yyyy'),
        start: format(startOfMonth(d), 'yyyy-MM-dd'),
        end: format(endOfMonth(d), 'yyyy-MM-dd')
      });
    }

    return months.map(m => {
      const monthBookings = bookings.filter(b => b.date >= m.start && b.date <= m.end);
      return {
        name: m.name,
        Resort: monthBookings.filter(b => b.type === 'resort').length,
        Turf: monthBookings.filter(b => b.type === 'turf').length,
        Event: monthBookings.filter(b => b.type === 'event').length,
      };
    });
  };
  const monthlyData = getMonthlyData();

  // 3. Status Ratio (Donut Chart)
  const statusData = [
    { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length },
    { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
    { name: 'Paid', value: bookings.filter(b => b.status === 'paid').length },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length },
  ].filter(d => d.value > 0);

  // 4. Revenue Trend (Line Chart - simplified based on fixed advance amounts)
  const getRevenueData = () => {
    const ADVANCE_AMOUNTS: Record<string, number> = { resort: 500, turf: 200, event: 1000 };
    
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      months.push({
        name: format(d, 'MMM yyyy'),
        start: format(startOfMonth(d), 'yyyy-MM-dd'),
        end: format(endOfMonth(d), 'yyyy-MM-dd')
      });
    }

    return months.map(m => {
      const monthBookings = bookings.filter(b => 
        b.date >= m.start && 
        b.date <= m.end && 
        (b.status === 'paid' || b.status === 'confirmed')
      );
      
      const revenue = monthBookings.reduce((sum, b) => sum + (ADVANCE_AMOUNTS[b.type] || 0), 0);
      
      return {
        name: m.name,
        Revenue: revenue
      };
    });
  };
  const revenueData = getRevenueData();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D9D78]"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#1B4332]">Analytics Overview</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bookings by Type */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Type</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Ratio */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Ratio</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bookings per Month */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings Trend (Last 6 Months)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Resort" stackId="a" fill="#1B4332" />
                  <Bar dataKey="Turf" stackId="a" fill="#2D9D78" />
                  <Bar dataKey="Event" stackId="a" fill="#F2C94C" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (Advance Payments)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="Revenue" stroke="#2D9D78" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
