import { createContext, useContext, useState } from 'react';
import { apiLogin, apiRegister, apiLogout } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    () => JSON.parse(localStorage.getItem('ev_current_user')) || null
  );

  async function signup({ firstName, lastName, email, password, phone }) {
    try {
      const username = email.split('@')[0];
      await apiRegister({ username, firstName, lastName, phoneNumber: phone, email, password });
      const loginData = await apiLogin({ email, password });
      const session = {
        firstName: loginData.firstName,
        lastName: loginData.lastName,
        email: loginData.email,
        phone: loginData.phoneNumber,
        username: loginData.username,
        routesRemaining: loginData.routesRemaining ?? 2,
      };
      localStorage.setItem('ev_current_user', JSON.stringify(session));
      localStorage.setItem('ev_show_tutorial', 'true');  
      setCurrentUser(session);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || 'Registration failed.' };
    }
  }

  async function login({ email, password }) {
    try {
      const data = await apiLogin({ email, password });
      const session = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phoneNumber,
        username: data.username,
        routesRemaining: data.routesRemaining ?? 2,
      };
      localStorage.setItem('ev_current_user', JSON.stringify(session));
      setCurrentUser(session);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || 'Invalid email or password.' };
    }
  }

  // Call this after a successful purchase to sync the new count
  function updateRoutesRemaining(newCount) {
    setCurrentUser(prev => {
      const updated = { ...prev, routesRemaining: newCount };
      localStorage.setItem('ev_current_user', JSON.stringify(updated));
      return updated;
    });
  }

  function logout() {
    apiLogout();
    localStorage.removeItem('ev_current_user');
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout, updateRoutesRemaining }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}