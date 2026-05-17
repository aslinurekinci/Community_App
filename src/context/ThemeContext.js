import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext(null);

const LIGHT = {
  background: '#FFFFFF',
  card: '#F8F9FB',
  text: '#1A1A1A',
  subText: '#888888',
  border: '#EAEAEA',
  primary: '#1C6EF2',
  tabBar: '#FFFFFF',
};

const DARK = {
  background: '#0D0D0D',
  card: '#1A1A2E',
  text: '#F0F0F0',
  subText: '#AAAAAA',
  border: '#2A2A3E',
  primary: '#4A90F0',
  tabBar: '#111122',
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? DARK : LIGHT;
  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
