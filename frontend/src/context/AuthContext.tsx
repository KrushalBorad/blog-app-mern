'use client';

import axios from 'axios';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  savedPosts: string[];
  toggleSavePost: (postId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  savedPosts: [],
  toggleSavePost: async () => {},
  loading: false,
  error: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setUser(response.data);
        fetchSavedPosts(token);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPosts = async (token: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/saved`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setSavedPosts(response.data.map((post: any) => post._id));
      }
    } catch (err) {
      console.error('Error fetching saved posts:', err);
      setSavedPosts([]);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      await fetchSavedPosts(token);
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      await fetchSavedPosts(token);
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSavedPosts([]);
  };

  const toggleSavePost = async (postId: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${postId}/toggle-save`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.saved) {
        setSavedPosts(prev => [...prev, postId]);
      } else {
        setSavedPosts(prev => prev.filter(id => id !== postId));
      }
    } catch (err) {
      console.error('Error toggling save post:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        savedPosts,
        toggleSavePost,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}