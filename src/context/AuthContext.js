import { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return null;
    const parsed = JSON.parse(savedUser);
    // If user object is nested, extract it
    if (parsed && parsed._id) return parsed;
    if (parsed && parsed.user && parsed.user._id) return parsed.user;
    return null;
  });

  // Login via backend. Returns user data on success or throws on failure.
  const login = async ({ email, password }) => {
    if (!email || !password) throw new Error('Email and password are required');
    const data = await loginUser({ email, password });
    const userObj = data.user || data;
    if (!userObj._id) throw new Error('Login failed: user id missing');
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', data.token || userObj.token);
    return userObj;
  };

  // Register via backend. Returns created user data.
  const register = async ({ name, email, phone, password }) => {
    if (!email || !password || !name || !phone) throw new Error('All fields are required');
    const data = await registerUser({ name, email, phone, password });
    const userObj = data.user || data;
    if (!userObj._id) throw new Error('Register failed: user id missing');
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    localStorage.setItem('token', data.token || userObj.token);
    return userObj;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};
