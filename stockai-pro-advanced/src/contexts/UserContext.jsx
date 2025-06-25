// Contexto para manejo de usuario
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    id: 'default',
    name: 'Usuario',
    preferences: {
      defaultView: 'dashboard',
      itemsPerPage: 50,
      notifications: true,
      autoRefresh: true,
      refreshInterval: 30000
    }
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('stockai-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('stockai-user', JSON.stringify(updatedUser));
  };

  const updatePreferences = (preferences) => {
    const updatedUser = { 
      ...user, 
      preferences: { ...user.preferences, ...preferences } 
    };
    setUser(updatedUser);
    localStorage.setItem('stockai-user', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, updatePreferences }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

