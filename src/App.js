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

import SplashScreen from "./components/SplashScreen";

function AppContent() {
  const location = useLocation();
  const { isLoggedIn } = React.useContext(AuthContext);

  // Hide navbar on login page AND splash screen
  const hideNavbar = location.pathname === "/login" || location.pathname === "/";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>


        {/* Splash Screen Route */}
        <Route path="/" element={<SplashScreen />} />

        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/digital-locker"
          element={
            <ProtectedRoute>
              <DigitalLocker />
            </ProtectedRoute>
          }
        />

        <Route
          path="/relief-camps"
          element={
            <ProtectedRoute>
              <ReliefCamps />
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <Volunteers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donations"
          element={
            <ProtectedRoute>
              <Donations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <Community />
            </ProtectedRoute>
          }
        />

        {/* ⭐ Updated default: If not logged in → intro, otherwise dashboard */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} />}
        />
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
