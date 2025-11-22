export type Role = 'admin' | 'student';

export interface User {
  email: string;
  rollNumber?: string;
  role: Role;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: 'Workshop' | 'Seminar' | 'Cultural' | 'Tech';
  capacity: number;
  bookedCount: number;
}

export interface Booking {
  id: string;
  eventId: string;
  userEmail: string;
  timestamp: number;
  status: 'active' | 'cancelled';
}