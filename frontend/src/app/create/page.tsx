'use client';

import ImageUpload from '@/components/ImageUpload';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to create a post');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create FormData object
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      console.log('Sending create post request:', {
        title,
        content,
        hasImage: !!image,
        token: token.substring(0, 20) + '...' // Only log part of the token for security
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blogs`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Create post response:', response.data);

      // Clear form
      setTitle('');
      setContent('');
      setImage(null);

      // Show success message
      setSuccess('Post created successfully!');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error('Error creating post:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create post');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/50 backdrop-blur-sm shadow-xl rounded-lg p-6 sm:p-8 border border-purple-900/30">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">Create New Post</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="mt-1 block w-full rounded-md bg-gray-800/50 border-gray-700 text-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image
              </label>
              <ImageUpload onImageUpload={setImage} />
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            {success && (
              <div className="text-green-400 text-sm">{success}</div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 