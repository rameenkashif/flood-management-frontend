import { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Login via backend. Returns user data on success or throws on failure.
  const login = async ({ email, password }) => {
    if (!email || !password) throw new Error('Email and password are required');
    const data = await loginUser({ email, password });
    const userData = { email: data.email, name: data.name, token: data.token };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', data.token);
    return userData;
  };

  // Register via backend. Returns created user data.
  const register = async ({ name, email, phone, password }) => {
    if (!email || !password || !name || !phone) throw new Error('All fields are required');
    const data = await registerUser({ name, email, phone, password });
    const userData = { email: data.email, name: data.name, token: data.token };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', data.token);
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // remove from localStorage
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
