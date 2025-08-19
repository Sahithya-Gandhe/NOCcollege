import React from 'react';
import './HomePage.css';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleprovider } from '../firebaseconfig';

const HomePage = () => {
  const navigate = useNavigate();
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleprovider);
      const user = result.user;
      alert('Signed in successfully with Google!');
      // Navigation is now handled in App.jsx based on auth state
      // Redirect or update UI upon successful login
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
      alert('Failed to sign in with Google: ' + error.message);
    }
  };

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <h1>Welcome to NOC College</h1>
        <p>Our objective is to make the process of collecting No Objection Forms from the college seamless just by filling an online form. This reduces the workload for both faculty and students.</p>

        <section className="features-section">
          <h2>Key Features</h2>
          <div className="feature-list">
            <div className="feature-item">
              <h3>Streamlined Process</h3>
              <p>Automate NOC request and approval, reducing manual paperwork and delays.</p>
            </div>
            <div className="feature-item">
              <h3>Real-time Tracking</h3>
              <p>Monitor the status of your NOC requests at every stage, from submission to approval.</p>
            </div>
            <div className="feature-item">
              <h3>Secure & Accessible</h3>
              <p>Access your NOCs securely from anywhere, anytime, with robust data protection.</p>
            </div>
          </div>
        </section>


        <div className="homepage-buttons">
          <button className="login-button admin-button" onClick={() => navigate('/admin-login')}>Login as Admin</button>
          <button className="login-button student-button" onClick={signInWithGoogle}>
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M9 3.48c1.86 0 3.24.8 3.98 1.55l2.6-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.94L3.6 7.04C4.24 5.27 6.4 3.48 9 3.48z" fill="#EA4335"/>
              <path d="M17.64 9.2c0-.65-.06-1.28-.17-1.88H9v3.57h4.77c-.2.98-.86 2.4-2.77 3.64l2.86 2.2c1.7-1.57 2.68-3.88 2.68-6.53z" fill="#4285F4"/>
              <path d="M3.6 10.96c-.1-.29-.16-.59-.16-.9s.06-.61.16-.9L.96 6.2C.35 7.44 0 8.78 0 10.2c0 1.42.35 2.76.96 4L3.6 10.96z" fill="#FBBC05"/>
              <path d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.86-2.2c-1.17.8-2.6 1.27-3.1 1.27-2.6 0-4.76-1.79-5.4-3.56L.96 14C2.44 16.98 5.48 18 9 18z" fill="#34A853"/>
            </svg>
            Login to SRITW NOC
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;