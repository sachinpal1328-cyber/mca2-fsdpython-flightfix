import React, { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ff_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    const res = await api.post('/accounts/login/', { username, password });
    const { access, refresh, user: userData } = res.data;
    localStorage.setItem('ff_access_token', access);
    localStorage.setItem('ff_refresh_token', refresh);
    localStorage.setItem('ff_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    const refresh = localStorage.getItem('ff_refresh_token');
    try {
      if (refresh) {
        await api.post('/accounts/logout/', { refresh });
      }
    } catch {
      // Ignore logout network error
    } finally {
      localStorage.removeItem('ff_access_token');
      localStorage.removeItem('ff_refresh_token');
      localStorage.removeItem('ff_user');
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    const res = await api.get('/accounts/me/');
    localStorage.setItem('ff_user', JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshProfile, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
