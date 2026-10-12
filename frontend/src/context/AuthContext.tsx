import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (payload: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('edusmart_token');
      const storedUser = localStorage.getItem('edusmart_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // Verify with backend
          const me = await authApi.getMe();
          if (me.user) {
            setUser(me.user);
            localStorage.setItem('edusmart_user', JSON.stringify(me.user));
          } else {
            // Invalid session
            localStorage.removeItem('edusmart_token');
            localStorage.removeItem('edusmart_user');
            setUser(null);
            setToken(null);
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('edusmart_token');
          localStorage.removeItem('edusmart_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await authApi.login(email.trim(), pass);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('edusmart_token', res.token);
        localStorage.setItem('edusmart_user', JSON.stringify(res.user));
        return { success: true, message: res.message || 'Login berhasil!' };
      }
      return { success: false, message: res.message || 'Gagal login.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message || 'Gagal terhubung ke server autentikasi.' };
    }
  };

  const register = async (payload: any) => {
    try {
      const res = await authApi.register(payload);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('edusmart_token', res.token);
        localStorage.setItem('edusmart_user', JSON.stringify(res.user));
        return { success: true, message: res.message || 'Registrasi berhasil!' };
      }
      return { success: false, message: res.message || 'Gagal mendaftar.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message || 'Gagal mendaftarkan akun.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('edusmart_token');
    localStorage.removeItem('edusmart_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
