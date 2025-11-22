import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, Calendar, MapPin, PlusCircle, Trash2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';

// --- Components ---
const Navbar = () => {
  const { user, logout } = useApp();
  return (
    <nav className="bg-amrita-primary text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Amrita Events</h1>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-amrita-secondary uppercase">{user.role}</div>
            </div>
            <button onClick={logout} className="p-2 bg-red-800 rounded-full hover:bg-red-900"><LogOut size={18} /></button>
          </div>
        )}
      </div>
    </nav>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') {
      if (login(email).success) navigate('/dashboard');
      else alert('Invalid Amrita Email');
    } else alert('Invalid OTP');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-t-4 border-amrita-primary">
        <h2 className="text-2xl font-bold text-amrita-primary mb-6 text-center">Amrita Login</h2>
        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); alert('OTP: 123456'); }} className="space-y-4">
            <input className="w-full p-3 border rounded" placeholder="email@cb.students.amrita.edu" value={email} onChange={e => setEmail(e.target.value)} required />
            <button className="w-full bg-amrita-primary text-white py-3 rounded font-bold">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <input className="w-full p-3 border rounded text-center tracking-widest" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
            <button className="w-full bg-amrita-secondary text-white py-3 rounded font-bold">Verify</button>
          </form>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, events, bookings, bookEvent, deleteEvent, addEvent } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [ticket, setTicket] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<any>({ title: '', date: '', venue: '', capacity: 100, category: 'Tech' });

  if (!user) return <Navigate to="/" />;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Events</h2>
        {user.role === 'admin' && (
          <button onClick={() => setShowModal(true)} className="bg-amrita-primary text-white px-4 py-2 rounded flex gap-2 items-center">
            <PlusCircle size={18} /> Add Event
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {events.map(ev => {
          const isBooked = bookings.some(b => b.eventId === ev.id && b.userEmail === user.email);
          return (
            <div key={ev.id} className="bg-white rounded-lg shadow border-l-4 border-amrita-secondary p-5">
              <div className="flex justify-between"><span className="bg-orange-100 text-amrita-secondary text-xs px-2 py-1 rounded">{ev.category}</span><span className="text-xs text-gray-500">{ev.bookedCount}/{ev.capacity}</span></div>
              <h3 className="font-bold text-lg mt-2">{ev.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{ev.description}</p>
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <div className="flex items-center gap-2"><Calendar size={14}/> {ev.date} • {ev.time}</div>
                <div className="flex items-center gap-2"><MapPin size={14}/> {ev.venue}</div>
              </div>
              {user.role === 'admin' ? (
                <button onClick={() => deleteEvent(ev.id)} className="w-full border border-red-500 text-red-500 py-2 rounded flex justify-center gap-2"><Trash2 size={16}/> Delete</button>
              ) : isBooked ? (
                <button onClick={() => setTicket(ev.id)} className="w-full bg-green-600 text-white py-2 rounded">View Ticket</button>
              ) : (
                <button onClick={() => bookEvent(ev.id)} disabled={ev.bookedCount >= ev.capacity} className="w-full bg-amrita-secondary text-white py-2 rounded disabled:bg-gray-400">Book Now</button>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="font-bold mb-4">Add Event</h3>
            <input className="w-full border p-2 mb-2 rounded" placeholder="Title" onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
            <input className="w-full border p-2 mb-2 rounded" placeholder="Venue" onChange={e => setNewEvent({...newEvent, venue: e.target.value})} />
            <div className="flex gap-2 mb-4">
              <input type="date" className="w-full border p-2 rounded" onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              <input type="time" className="w-full border p-2 rounded" onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
            </div>
            <button onClick={() => { addEvent(newEvent); setShowModal(false); }} className="w-full bg-amrita-primary text-white py-2 rounded">Create</button>
            <button onClick={() => setShowModal(false)} className="w-full mt-2 text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {ticket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4" onClick={() => setTicket(null)}>
          <div className="bg-white p-8 rounded text-center">
            <QRCodeSVG value={`AMRITA-${ticket}-${user.email}`} size={200} />
            <p className="mt-4 font-mono text-xs">Scan at venue</p>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;