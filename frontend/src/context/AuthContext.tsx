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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    }
  }, [user]);

  const fetchSavedPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/saved`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setSavedPosts(response.data.map((post: Post) => post.id));
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
    }
  };

  const toggleSavePost = async (postId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${postId}/toggle-save`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSavedPosts(response.data.map((post: Post) => post.id));
    } catch (error) {
      console.error('Failed to toggle save post:', error);
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      router.push('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to login');
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/users/register`, {
        name,
        email,
        password
      });

      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      router.push('/');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to register');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSavedPosts([]);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
        error,
        savedPosts,
        toggleSavePost
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