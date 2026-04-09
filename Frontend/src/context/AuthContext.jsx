import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(
    () => JSON.parse(localStorage.getItem('ev_current_user')) || null
  );

  // Register a new user — stores in localStorage under ev_users
  function signup({ email, password, phone }) {
    const users = JSON.parse(localStorage.getItem('ev_users') || '[]');
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { success: false, error: 'An account with this email already exists.' };

    const newUser = { email, password, phone };
    users.push(newUser);
    localStorage.setItem('ev_users', JSON.stringify(users));
    localStorage.setItem('ev_current_user', JSON.stringify({ email, phone }));
    setCurrentUser({ email, phone });
    return { success: true };
  }

  // Login — checks stored users
  function login({ email, password }) {
    const users = JSON.parse(localStorage.getItem('ev_users') || '[]');
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, error: 'Invalid email or password.' };

    const session = { email: user.email, phone: user.phone };
    localStorage.setItem('ev_current_user', JSON.stringify(session));
    setCurrentUser(session);
    return { success: true };
  }

  function logout() {
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