import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (userData: User) => void;
  logout: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  const [users] = useState<User[]>([
    { 
      id: '1', 
      nombre: 'Admin', 
      email: 'admin@gmail.com', 
      rol: 'admin', 
      password: '12345' 
    }
  ]);

  // Aplica la clase 'dark' a nivel global en la etiqueta html
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};