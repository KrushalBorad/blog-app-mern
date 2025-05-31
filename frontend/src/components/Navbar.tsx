'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout, savedPosts } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-purple-900/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Blog App
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                  isActive('/') 
                    ? 'text-purple-400 bg-purple-900/50'
                    : 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/30'
                }`}
              >
                Home
              </Link>
              {user && (
                <Link
                  href="/saved"
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1 ${
                    isActive('/saved')
                      ? 'text-purple-400 bg-purple-900/50'
                      : 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/30'
                  }`}
                >
                  <span>Saved</span>
                  {savedPosts.length > 0 && (
                    <span className="bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full text-xs font-medium">
                      {savedPosts.length}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/create"
                  className="hidden md:flex items-center space-x-1 px-4 py-2 rounded-lg bg-purple-900/50 text-purple-300 hover:bg-purple-800/60 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>New Post</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    {user.name?.charAt(0) || '?'}
                  </div>
                  <button
                    onClick={logout}
                    className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-purple-400 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 