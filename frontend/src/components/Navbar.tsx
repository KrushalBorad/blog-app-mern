'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">Blog App</span>
            </Link>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <Link
                  href="/create"
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  Create Post
                </Link>
                <button
                  onClick={logout}
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 