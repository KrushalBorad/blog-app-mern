'use client';

import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: string;
  likes?: string[];
}

export default function BlogPost({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${params.id}`);
        setBlog(response.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };

    fetchBlog();
  }, [params.id]);

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const userIdStr = user.id?.toString();
      if (!userIdStr) {
        setError('Invalid user ID');
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${params.id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBlog(prev => ({
        ...prev,
        likes: response.data.likes || []
      }));
    } catch (err) {
      console.error('Error liking post:', err);
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  const isPostLiked = (blog: BlogPost) => {
    if (!user?.id || !blog.likes) return false;
    const userIdStr = user.id.toString();
    return blog.likes.some(id => id?.toString() === userIdStr);
  };

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="bg-white/80 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden">
          {blog.imageUrl && (
            <div className="relative h-64 sm:h-96">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>
            <div className="flex items-center text-gray-600 mb-6">
              <span className="mr-4">By {blog.author.name}</span>
              <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="prose prose-purple max-w-none">
              {blog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700">
                  {paragraph}
                </p>
              ))}
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center ${
                isPostLiked(blog)
                  ? 'text-red-400 hover:text-red-300'
                  : 'text-gray-400 hover:text-gray-300'
              } transition-colors duration-300 text-sm`}
              title={user ? 'Like/Unlike post' : 'Login to like posts'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill={isPostLiked(blog) ? 'currentColor' : 'none'}
                stroke="currentColor"
              >
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              {blog.likes?.filter(id => id != null).length || 0} {blog.likes?.filter(id => id != null).length === 1 ? 'Like' : 'Likes'}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
} 