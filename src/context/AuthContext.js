import { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // initialize from localStorage if available
    const savedUser = localStorage.getItem('user');
    if (savedUser) return JSON.parse(savedUser);
    // default shape kept so consumers can read user.token and user.role safely
    return { token: null, role: null, email: null, name: null };
  });

  // Login via backend. Backend determines role based on user record.
  const login = async ({ email, password } = {}) => {
    if (!email || !password) throw new Error('Email and password are required');
    // call backend
    let data;
    try {
      data = await loginUser({ email, password });
    } catch (err) {
      // rethrow so UI can show error
      throw err;
    }

    // Role comes from backend only (no client-side role assignment)
    const role = data?.role || 'user';

    const userData = { token: data.token, role, email: data.email || email, name: data.name };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', data.token);
    return userData;
  };

  // Register via backend. Backend assigns role based on record (always 'user' for registration).
  const register = async ({ name, email, phone, password } = {}) => {
    if (!email || !password || !name || !phone) throw new Error('All fields are required');
    const data = await registerUser({ name, email, phone, password });
    const role = data?.role || 'user';
    const userData = { token: data.token, role, email: data.email || email, name: data.name };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', data.token);
    return userData;
  };

  const logout = () => {
    setUser({ token: null, role: null, email: null, name: null });
    localStorage.removeItem('user'); // remove from localStorage
    localStorage.removeItem('token');
  };

  const isLoggedIn = !!user && !!user.token;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// convenience hook
export const useAuth = () => useContext(AuthContext);
