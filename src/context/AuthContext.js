import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Login returns true if both email and password are filled
  const login = ({ email, password }) => {
    if (email && email.trim() !== '' && password && password.trim() !== '') {
      const userData = { email };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData)); // save in localStorage
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // remove from localStorage
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
