import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DigitalLocker from './pages/DigitalLocker';
import ReliefCamps from './pages/ReliefCamps';
import Volunteers from './pages/Volunteers';
import Alerts from './pages/Alerts';
import Donations from './pages/Donations';
import Community from './pages/Community';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/digital-locker" element={<DigitalLocker />} />
          <Route path="/relief-camps" element={<ReliefCamps />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; // ✅ make sure this line exists
