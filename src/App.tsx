import { useEffect, useState } from 'react';
import BookingPage from './pages/BookingPage';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'littlemangalore2026') {
      setIsAdmin(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-text font-sans flex flex-col">
      {isAdmin ? <AdminPanel /> : <BookingPage />}
    </div>
  );
}
