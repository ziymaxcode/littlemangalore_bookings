import React, { useState, useEffect } from 'react';
import AdminLayout from '@/src/components/admin/AdminLayout';
import { supabase } from '@/src/lib/supabase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Lock, Unlock, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Booking {
  id: string;
  date: string;
  type: string;
  status: string;
  name: string;
  time_slot?: string;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected Date Details
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    const [bookingsRes, blockedRes] = await Promise.all([
      supabase.from('bookings').select('*').gte('date', start).lte('date', end),
      supabase.from('blocked_dates').select('*').gte('date', start).lte('date', end)
    ]);

    if (!bookingsRes.error && bookingsRes.data) {
      setBookings(bookingsRes.data);
    }
    if (!blockedRes.error && blockedRes.data) {
      setBlockedDates(blockedRes.data);
    }
    setLoading(false);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsDrawerOpen(true);
  };

  const toggleBlockDate = async (dateStr: string, isBlocked: boolean, blockedId?: string) => {
    if (isBlocked && blockedId) {
      // Unblock
      const { error } = await supabase.from('blocked_dates').delete().eq('id', blockedId);
      if (!error) {
        setBlockedDates(blockedDates.filter(b => b.id !== blockedId));
      }
    } else {
      // Block
      const reason = prompt("Reason for blocking this date?");
      if (reason !== null) {
        const { data, error } = await supabase
          .from('blocked_dates')
          .insert([{ date: dateStr, reason, type: 'all' }])
          .select()
          .single();
        
        if (!error && data) {
          setBlockedDates([...blockedDates, data]);
        }
      }
    }
  };

  const getDayBookings = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return bookings.filter(b => b.date === dateStr);
  };

  const getDayBlocked = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return blockedDates.find(b => b.date === dateStr);
  };

  return (
    <AdminLayout>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#2D9D78]" />
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-200 text-gray-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden border border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}

            {/* Empty cells for start of month offset */}
            {Array.from({ length: days[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white min-h-[100px] p-2 opacity-50"></div>
            ))}

            {/* Days */}
            {days.map((day) => {
              const dayBookings = getDayBookings(day);
              const blocked = getDayBlocked(day);
              const isToday = isSameDay(day, new Date());
              const dateStr = format(day, 'yyyy-MM-dd');

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  className={cn(
                    "bg-white min-h-[100px] p-2 cursor-pointer hover:bg-gray-50 transition-colors relative group border-t border-l border-gray-100",
                    blocked && "bg-red-50 hover:bg-red-100"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      isToday ? "bg-[#2D9D78] text-white" : "text-gray-700"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {/* Quick block/unblock button (visible on hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBlockDate(dateStr, !!blocked, blocked?.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-700 transition-opacity"
                      title={blocked ? "Unblock Date" : "Block Date"}
                    >
                      {blocked ? <Unlock className="w-4 h-4 text-red-500" /> : <Lock className="w-4 h-4" />}
                    </button>
                  </div>

                  {blocked ? (
                    <div className="mt-2 text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded truncate">
                      Blocked: {blocked.reason || 'Manual'}
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1">
                      {dayBookings.slice(0, 3).map(b => (
                        <div 
                          key={b.id} 
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded truncate font-medium",
                            b.status === 'confirmed' ? "bg-green-100 text-green-800" :
                            b.status === 'paid' ? "bg-blue-100 text-blue-800" :
                            b.status === 'cancelled' ? "bg-gray-100 text-gray-500 line-through" :
                            "bg-yellow-100 text-yellow-800"
                          )}
                        >
                          {b.type === 'turf' && b.time_slot ? `${b.time_slot.split('-')[0]} ` : ''}
                          {b.name}
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium pl-1">
                          +{dayBookings.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side Drawer for Day Details */}
      {isDrawerOpen && selectedDate && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-25 transition-opacity" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
            <div className="w-full h-full bg-white shadow-xl flex flex-col transform transition-transform">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Close panel</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 flex-1 overflow-y-auto">
                {getDayBlocked(selectedDate) ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Date Blocked
                    </h4>
                    <p className="text-sm mt-1">Reason: {getDayBlocked(selectedDate)?.reason}</p>
                    <button 
                      onClick={() => toggleBlockDate(format(selectedDate, 'yyyy-MM-dd'), true, getDayBlocked(selectedDate)?.id)}
                      className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline"
                    >
                      Unblock Date
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-900">Bookings ({getDayBookings(selectedDate).length})</h4>
                      <button 
                        onClick={() => toggleBlockDate(format(selectedDate, 'yyyy-MM-dd'), false)}
                        className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" /> Block Date
                      </button>
                    </div>

                    {getDayBookings(selectedDate).length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No bookings for this date.</p>
                    ) : (
                      <div className="space-y-3">
                        {getDayBookings(selectedDate).map(b => (
                          <div key={b.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-medium text-gray-900">{b.name}</span>
                                <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">
                                  {b.type}
                                </span>
                              </div>
                              <span className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                b.status === 'confirmed' ? "bg-green-100 text-green-800" :
                                b.status === 'paid' ? "bg-blue-100 text-blue-800" :
                                b.status === 'cancelled' ? "bg-gray-100 text-gray-800" :
                                "bg-yellow-100 text-yellow-800"
                              )}>
                                {b.status}
                              </span>
                            </div>
                            {b.time_slot && <div className="text-sm text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {b.time_slot}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
