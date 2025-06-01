'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout, savedPosts } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to generate profile color based on name
  const getProfileColor = (name: string) => {
    const colors = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-blue-500',
      'from-purple-500 to-pink-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link 
            href="/" 
            className="flex items-center space-x-2 sm:space-x-3 text-white hover:text-pink-100 transition-colors duration-300"
          >
            <svg 
              className="h-6 w-6 sm:h-8 sm:w-8" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
            <span className="text-lg sm:text-xl font-bold">Blog App</span>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <>
                <Link
                  href="/saved"
                  className="flex items-center text-white hover:text-pink-100 transition-colors duration-300"
                >
                  <div className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {savedPosts.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-pink-500 text-white text-[10px] sm:text-xs font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                        {savedPosts.length}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 sm:space-x-3 text-white focus:outline-none"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r ${getProfileColor(user.name || 'User')} flex items-center justify-center text-white font-bold shadow-lg transform hover:scale-105 transition-all duration-300`}>
                      {user.name?.charAt(0) || 'U'}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 animate-fade-in-down">
                      <div className="px-3 sm:px-4 py-2 border-b border-gray-100">
                        <p className="text-xs sm:text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/create"
                        className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Create Post</span>
                        </div>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-300"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link
                  href="/login"
                  className="text-white hover:text-pink-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition-colors duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-purple-600 hover:bg-pink-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 