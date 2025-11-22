import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Event, Booking } from '../types';

interface AppContextType {
  user: User | null;
  events: Event[];
  bookings: Booking[];
  login: (email: string, rollNo?: string) => { success: boolean; message: string };
  logout: () => void;
  addEvent: (event: Omit<Event, 'id' | 'bookedCount'>) => void;
  deleteEvent: (id: string) => void;
  bookEvent: (eventId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_EVENTS: Event[] = [
  { id: '1', title: 'Gokulashtami Celebrations', description: 'Annual cultural fest.', date: '2025-08-20', time: '10:00', venue: 'Main Auditorium', category: 'Cultural', capacity: 500, bookedCount: 120 },
  { id: '2', title: 'Ethical Hacking Workshop', description: 'Learn cybersecurity basics.', date: '2025-09-10', time: '14:00', venue: 'IT Lab 1', category: 'Tech', capacity: 50, bookedCount: 45 },
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('amrita_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('amrita_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('amrita_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('amrita_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('amrita_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('amrita_bookings', JSON.stringify(bookings)); }, [bookings]);

  const login = (email: string, rollNo?: string) => {
    const isStudent = email.includes('students.amrita.edu') || email.includes('student');
    const isAdmin = email.endsWith('amrita.edu') && !isStudent;

    if (!isStudent && !isAdmin) return { success: false, message: 'Use official Amrita email' };

    setUser({
      email,
      name: email.split('@')[0],
      role: isAdmin ? 'admin' : 'student',
      rollNumber: isStudent ? rollNo : undefined
    });
    return { success: true, message: 'Success' };
  };

  const logout = () => setUser(null);
  const addEvent = (data: any) => setEvents([...events, { ...data, id: crypto.randomUUID(), bookedCount: 0 }]);
  const deleteEvent = (id: string) => setEvents(events.filter(e => e.id !== id));
  const bookEvent = (eventId: string) => {
    if (!user) return false;
    const evIndex = events.findIndex(e => e.id === eventId);
    if (evIndex === -1 || events[evIndex].bookedCount >= events[evIndex].capacity) return false;
    if (bookings.some(b => b.eventId === eventId && b.userEmail === user.email)) return false;

    setBookings([...bookings, { id: crypto.randomUUID(), eventId, userEmail: user.email, timestamp: Date.now(), status: 'active' }]);
    const newEvents = [...events];
    newEvents[evIndex].bookedCount++;
    setEvents(newEvents);
    return true;
  };

  return (
    <AppContext.Provider value={{ user, events, bookings, login, logout, addEvent, deleteEvent, bookEvent }}>
      {children}
    </AppContext.Provider>
  );
};
export const useApp = () => {
    const context = useContext(AppContext);
    if(!context) throw new Error("useApp");
    return context;
}