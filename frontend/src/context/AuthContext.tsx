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
  switchRoleDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('edusmart_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('edusmart_token');
      const storedUser = localStorage.getItem('edusmart_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Verify with backend
          const me = await authApi.getMe();
          if (me.user) {
            setUser(me.user);
            localStorage.setItem('edusmart_user', JSON.stringify(me.user));
          }
        } catch {
          // Token expired or server unreachable
          console.log('Session verification completed.');
        }
      } else {
        // Auto demo login as Mahasiswa so it works out of the box
        await autoDemoLogin();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const autoDemoLogin = async () => {
    try {
      const res = await authApi.login('mahasiswa@kampus.ac.id', '123456');
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('edusmart_token', res.token);
        localStorage.setItem('edusmart_user', JSON.stringify(res.user));
      }
    } catch {
      // Fallback offline mock user
      const mock: User = {
        id: 'usr-mhs-1',
        email: 'mahasiswa@kampus.ac.id',
        fullName: 'Budi Pratama',
        role: 'mahasiswa',
        nimNip: '2024001',
        department: 'Teknik Informatika - Semester 7',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      };
      setUser(mock);
    }
  };

  const login = async (email: string, pass: string) => {
    try {
      const res = await authApi.login(email, pass);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('edusmart_token', res.token);
        localStorage.setItem('edusmart_user', JSON.stringify(res.user));
        return { success: true, message: res.message || 'Login berhasil!' };
      }
      return { success: false, message: 'Gagal login.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
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
      return { success: false, message: 'Gagal mendaftar.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('edusmart_token');
    localStorage.removeItem('edusmart_user');
    setUser(null);
    setToken(null);
  };

  const switchRoleDemo = async () => {
    if (user?.role === 'mahasiswa') {
      // Switch to Dosen
      await login('dosen@kampus.ac.id', '123456');
    } else {
      // Switch to Mahasiswa
      await login('mahasiswa@kampus.ac.id', '123456');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchRoleDemo }}>
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
