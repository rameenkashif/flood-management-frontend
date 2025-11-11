import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
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
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/digital-locker" element={isLoggedIn ? <DigitalLocker /> : <Navigate to="/login" />} />
        <Route path="/relief-camps" element={isLoggedIn ? <ReliefCamps /> : <Navigate to="/login" />} />
        <Route path="/volunteers" element={isLoggedIn ? <Volunteers /> : <Navigate to="/login" />} />
        <Route path="/alerts" element={isLoggedIn ? <Alerts /> : <Navigate to="/login" />} />
        <Route path="/donations" element={isLoggedIn ? <Donations /> : <Navigate to="/login" />} />
        <Route path="/community" element={isLoggedIn ? <Community /> : <Navigate to="/login" />} />
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
