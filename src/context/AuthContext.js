import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const savedToken = await AsyncStorage.getItem('userToken');
      const savedUser = await AsyncStorage.getItem('userData');
      if (savedToken) {
        setToken(savedToken);
        setUser(savedUser ? JSON.parse(savedUser) : null);
      }
      setBootstrapping(false);
    };
    restore();
  }, []);

  const login = async (accessToken, userData) => {
    await AsyncStorage.setItem('userToken', accessToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['userToken', 'userData']);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, bootstrapping }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
