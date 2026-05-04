import { createContext, useContext, useState } from 'react';
import { apiLogin, apiRegister, apiLogout, getToken, removeToken } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    () => JSON.parse(localStorage.getItem('ev_current_user')) || null
  );

  // Register — calls real API
  async function signup({ firstName, lastName, email, password, phone }) {
    try {
      // backend uses "username" — we'll use email prefix as username
      const username = email.split('@')[0];
      await apiRegister({
        username,
        firstName,
        lastName,
        phoneNumber: phone,
        email,
        password,
      });

      // after register, auto login to get token
      const loginData = await apiLogin({ email, password });

      const session = {
        firstName:  loginData.firstName,
        lastName:   loginData.lastName,
        email:      loginData.email,
        phone:      loginData.phoneNumber,
        username:   loginData.username,
      };
      localStorage.setItem('ev_current_user', JSON.stringify(session));
      setCurrentUser(session);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || 'Registration failed.' };
    }
  }

  // Login — calls real API
  async function login({ email, password }) {
    try {
      const data = await apiLogin({ email, password });

      const session = {
        firstName: data.firstName,
        lastName:  data.lastName,
        email:     data.email,
        phone:     data.phoneNumber,
        username:  data.username,
      };
      localStorage.setItem('ev_current_user', JSON.stringify(session));
      setCurrentUser(session);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || 'Invalid email or password.' };
    }
  }

  function logout() {
    apiLogout();
    localStorage.removeItem('ev_current_user');
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}