import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

function getInitialTheme() {
  const stored = localStorage.getItem('ev_theme');
  if (stored) return stored;
  // follow system preference if no stored preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ev_theme', theme);
  }, [theme]);

  // listen to system preference changes
  useEffect(() => {
    const stored = localStorage.getItem('ev_theme');
    if (stored) return; // user has manually set a preference, don't override
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function handleChange(e) {
      setTheme(e.matches ? 'dark' : 'light');
    }
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('ev_theme', next); // mark as manually set
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}