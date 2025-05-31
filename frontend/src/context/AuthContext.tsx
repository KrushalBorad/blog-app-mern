'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  savedPosts: string[];
  toggleSavePost: (postId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const saved = localStorage.getItem('savedPosts');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // Verify the token and get the user ID from it
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.id) {
          setUser({
            id: decodedToken.id, // Use the ID from the token
            name: parsedUser.name,
            email: parsedUser.email
          });
        } else {
          console.error('Invalid token structure');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    
    if (saved) {
      try {
        setSavedPosts(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved posts:', error);
        localStorage.removeItem('savedPosts');
        setSavedPosts([]);
      }
    }
    
    setIsLoading(false);
  }, []);

  const toggleSavePost = (postId: string) => {
    setSavedPosts(prev => {
      const newSavedPosts = prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId];
      localStorage.setItem('savedPosts', JSON.stringify(newSavedPosts));
      return newSavedPosts;
    });
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Decode token to get user ID
      const decodedToken = parseJwt(data.token);
      if (!decodedToken || !decodedToken.id) {
        throw new Error('Invalid token received');
      }

      // Store token first
      localStorage.setItem('token', data.token);

      // Create user data with ID from token
      const userData = {
        id: decodedToken.id,
        name: data.user.name,
        email: data.user.email
      };

      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      
      // Decode token to get user ID
      const decodedToken = parseJwt(data.token);
      if (!decodedToken || !decodedToken.id) {
        throw new Error('Invalid token received');
      }

      // Store token first
      localStorage.setItem('token', data.token);

      // Create user data with ID from token
      const userData = {
        id: decodedToken.id,
        name: data.user.name,
        email: data.user.email
      };

      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('savedPosts');
    setUser(null);
    setSavedPosts([]);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, savedPosts, toggleSavePost }}>
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