import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './components/MobileLayout';
import Home from './pages/Home';
import SportsListing from './pages/SportsListing';
import Dashboard from './pages/Dashboard';
import BookingFlow from './pages/BookingFlow';

function App() {
  return (
    <Router>
      <MobileLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sports" element={<SportsListing />} />
          {/* Redirect old detail route to the new Booking Flow */}
          <Route path="/sport/:id" element={<Navigate to="/booking/:id" replace />} />
          <Route path="/booking/:id" element={<BookingFlow />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Dashboard />} />
        </Routes>
      </MobileLayout>
    </Router>
  );
}

export default App;
