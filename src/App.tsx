import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { LogOut, Calendar, MapPin, PlusCircle, Trash2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';

// --- Components ---

const Navbar = () => {
  const { user, logout } = useApp();
  return (
    <nav className="bg-[#A6192E] text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-[#A6192E] rounded-full flex items-center justify-center font-bold shadow-sm">A</div>
          <h1 className="text-xl font-bold tracking-wide">Amrita Events</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-white/90 uppercase tracking-wider font-bold">{user.role}</div>
            </div>
            <button 
              onClick={logout} 
              className="p-2 bg-red-900/30 rounded-full hover:bg-red-900 transition-colors text-white"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState(''); 
  const [step, setStep] = useState(1);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return alert("Please enter a valid email address");
    
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    alert(`DEMO SMS: Your Amrita OTP is ${randomOtp}`);
    
    setStep(2);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      const result = login(email);
      if (result.success) {
        navigate('/dashboard');
      } else {
        alert(result.message);
        setStep(1); 
        setOtp('');
      }
    } else {
      alert("Wrong OTP! Please check the alert message again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-t-4 border-[#A6192E]">
        <h2 className="text-2xl font-bold text-[#A6192E] mb-2 text-center">Amrita Login</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Event Management Portal</p>
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                // SAFETY FIX: Inline style forces black color
                style={{ color: 'black' }}
                className="w-full p-3 border border-gray-300 rounded text-black bg-white focus:ring-2 focus:ring-[#F37021] outline-none transition" 
                placeholder="name@cb.students.amrita.edu" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
              <p className="text-xs text-gray-500 mt-1">Use official university email ID</p>
            </div>
            <button className="w-full bg-[#A6192E] text-white py-3 rounded font-bold hover:bg-red-800 transition-colors shadow-lg">
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center mb-4">
              <span className="text-sm text-gray-600">OTP sent to </span>
              <span className="font-semibold text-[#A6192E]">{email}</span>
            </div>
            <input 
              // SAFETY FIX: Inline style forces black color
              style={{ color: 'black' }}
              className="w-full p-3 border border-gray-300 rounded text-center tracking-[0.5em] text-xl font-mono text-black bg-white focus:ring-2 focus:ring-[#F37021] outline-none" 
              placeholder="------" 
              maxLength={6}
              value={otp} 
              onChange={e => setOtp(e.target.value)} 
            />
            <button className="w-full bg-[#F37021] text-white py-3 rounded font-bold hover:bg-orange-600 transition-colors shadow-lg">
              Verify & Login
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="w-full text-sm text-gray-500 hover:text-[#A6192E] transition"
            >
              Change Email
            </button>
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
  const [newEvent, setNewEvent] = useState<any>({ title: '', description: '', date: '', time: '', venue: '', capacity: 100, category: 'Tech' });

  if (!user) return <Navigate to="/" />;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {user.role === 'admin' ? 'Admin Dashboard' : 'Upcoming Events'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user.name}</p>
        </div>
        
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowModal(true)} 
            className="bg-[#A6192E] text-white px-6 py-2.5 rounded-lg shadow hover:bg-red-800 transition flex gap-2 items-center font-medium"
          >
            <PlusCircle size={20} /> Create Event
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(ev => {
          const isBooked = bookings.some(b => b.eventId === ev.id && b.userEmail === user.email);
          const isFull = ev.bookedCount >= ev.capacity;

          return (
            <div key={ev.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#F37021] overflow-hidden flex flex-col h-full">
              <div className="p-5 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-orange-100 text-[#F37021] text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                    {ev.category}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {ev.bookedCount}/{ev.capacity} Seats
                  </span>
                </div>
                
                <h3 className="font-bold text-xl text-gray-800 mb-2">{ev.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ev.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#A6192E]"/> 
                    <span className="font-medium">{ev.date}</span> 
                    <span className="text-gray-300">|</span> 
                    <span>{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#A6192E]"/> 
                    <span>{ev.venue}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 mt-auto">
                {user.role === 'admin' ? (
                  <button 
                    onClick={() => deleteEvent(ev.id)} 
                    className="w-full border border-red-500 text-red-500 py-2.5 rounded-lg hover:bg-red-50 transition flex justify-center items-center gap-2 font-medium"
                  >
                    <Trash2 size={18}/> Delete Event
                  </button>
                ) : isBooked ? (
                  <button 
                    onClick={() => setTicket(ev.id)} 
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
                  >
                    View Ticket
                  </button>
                ) : (
                  <button 
                    onClick={() => bookEvent(ev.id)} 
                    disabled={isFull} 
                    className="w-full bg-[#F37021] text-white py-2.5 rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium shadow-sm"
                  >
                    {isFull ? 'Sold Out' : 'Book Now'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
            <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Create New Event</h3>
            <div className="space-y-3">
              <input 
                className="w-full border border-gray-300 p-2.5 rounded text-gray-900 bg-white focus:ring-2 focus:ring-[#F37021] outline-none" 
                placeholder="Event Title" 
                value={newEvent.title}
                onChange={e => setNewEvent({...newEvent, title: e.target.value})} 
              />
              <textarea 
                className="w-full border border-gray-300 p-2.5 rounded text-gray-900 bg-white focus:ring-2 focus:ring-[#F37021] outline-none resize-none" 
                rows={2}
                placeholder="Description" 
                value={newEvent.description}
                onChange={e => setNewEvent({...newEvent, description: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="date" 
                  className="w-full border border-gray-300 p-2.5 rounded text-gray-900 bg-white focus:ring-2 focus:ring-[#F37021] outline-none" 
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})} 
                />
                <input 
                  type="time" 
                  className="w-full border border-gray-300 p-2.5 rounded text-gray-900 bg-white focus:ring-2 focus:ring-[#F37021] outline-none" 
                  value={newEvent.time}
                  onChange={e => setNewEvent({...newEvent, time: e.target.value})} 
                />
              </div>
              <input 
                className="w-full border border-gray-300 p-2.5 rounded text-gray-900 bg-white focus:ring-2 focus:ring-[#F37021] outline-none" 
                placeholder="Venue (e.g. Main Auditorium)" 
                value={newEvent.venue}
                onChange={e => setNewEvent({...newEvent, venue: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-3">
                <select 
                  className="w-full border border-gray-300 p-2.5 rounded text-gray-900 bg-white focus:ring-2 focus:ring-[#F37021] outline-none"
                  value={newEvent.category}
                  onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                >
                  <option value="Tech">Tech</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Workshop">Workshop</option>
                </select>
                 <input 
                  type="number"
                  className="w-full border border-gray-300 p-2.5 rounded text-gray-900 bg-white focus:ring-2 focus:ring-[#F37021] outline-none" 
                  placeholder="Capacity" 
                  value={newEvent.capacity}
                  onChange={e => setNewEvent({...newEvent, capacity: parseInt(e.target.value)})} 
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)} 
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => { addEvent(newEvent); setShowModal(false); setNewEvent({ title: '', description: '', date: '', time: '', venue: '', capacity: 100, category: 'Tech' }); }} 
                className="flex-1 bg-[#A6192E] text-white py-2.5 rounded-lg hover:bg-red-800 transition font-bold"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {ticket && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setTicket(null)}>
          <div className="bg-white p-8 rounded-xl text-center shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-[#A6192E] mb-2">Entry Pass</h3>
            <p className="text-gray-500 text-sm mb-6">Scan this code at the venue entrance</p>
            
            <div className="bg-white p-4 inline-block border-4 border-[#F37021]/20 rounded-xl">
              <QRCodeSVG value={`AMRITA-EVENT-${ticket}-${user.email}`} size={200} />
            </div>
            
            <div className="mt-6 p-3 bg-gray-100 rounded font-mono text-xs text-gray-500 break-all">
              ID: {ticket}-{user.email.split('@')[0]}
            </div>
            
            <button 
              onClick={() => setTicket(null)} 
              className="mt-6 w-full text-[#F37021] font-bold hover:underline"
            >
              Close Ticket
            </button>
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