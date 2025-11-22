import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DigitalLocker from "./pages/DigitalLocker";
import ReliefCamps from "./pages/ReliefCamps";
import Volunteers from "./pages/Volunteers";
import Alerts from "./pages/Alerts";
import Donations from "./pages/Donations";
import Community from "./pages/Community";

function AppContent() {
  const location = useLocation();
  const { isLoggedIn } = React.useContext(AuthContext);

  // Hide navbar on login page
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/digital-locker" element={
          <ProtectedRoute>
            <DigitalLocker />
          </ProtectedRoute>
        } />

        <Route path="/relief-camps" element={
          <ProtectedRoute>
            <ReliefCamps />
          </ProtectedRoute>
        } />

        <Route path="/volunteers" element={
          <ProtectedRoute>
            <Volunteers />
          </ProtectedRoute>
        } />

        <Route path="/alerts" element={
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        } />

        <Route path="/donations" element={
          <ProtectedRoute>
            <Donations />
          </ProtectedRoute>
        } />

        <Route path="/community" element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
