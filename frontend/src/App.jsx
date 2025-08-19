import React, { useState, useEffect } from 'react';
import { auth } from './firebaseconfig';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import NocGenerator from './components/NocGenerator';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);

      // If a student logs in, go to student dashboard
      if (currentUser) {
        if (location.pathname === '/') {
          navigate('/student-dashboard');
        }
      } else {
        // If user logs out AND they are not on admin or NOC generation pages, go to home
        if (!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/generate-noc')) {
          navigate('/');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate, location]);

  return (
    <div className="App">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin-login" element={<AdminLogin setIsAdminLoggedIn={setIsAdminLoggedIn} />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />

        {/* Student routes */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/generate-noc" element={<NocGenerator />} />

        {/* Admin protected route */}
        <Route
          path="/admin-dashboard"
          element={isAdminLoggedIn ? <AdminDashboard /> : <AdminLogin setIsAdminLoggedIn={setIsAdminLoggedIn} />}
        />
      </Routes>
    </div>
  );
}

export default App;
