'use client';

import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

// Function to get image based on title (fallback)
const getPostImage = (title: string, imageUrl: string | undefined) => {
  // If there's a valid image URL from our backend
  if (imageUrl) {
    if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('/images/')) {
      return `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
    }
    return imageUrl;
  }

  // Use placeholder as fallback
  const text = encodeURIComponent(title.length > 20 ? title.substring(0, 20) + '...' : title);
  return `https://placehold.co/800x600/2a2a2a/ffffff.jpg?text=${text}`;
};

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

export default function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState<BlogPost[]>([]);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          return;
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/saved`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setSavedPosts(response.data.map((post: BlogPost) => ({
            ...post,
            likes: post.likes || []
          })));
        }
      } catch (error) {
        console.error('Error fetching saved posts:', error);
        setError('Failed to load saved posts');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [isAuthenticated, router]);

  const handleLike = async (postId: string) => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSavedPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, likes: response.data.likes || [] }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  const isPostLiked = (post: BlogPost) => {
    if (!user?.id || !post.likes) return false;
    const userIdStr = user.id.toString();
    return post.likes.some(id => id && id.toString() === userIdStr);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (savedPosts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">No saved posts yet</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Saved Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedPosts.map((post) => {
            const likeCount = post.likes?.filter(id => id != null).length || 0;
            return (
              <article key={post._id} className="bg-white/80 backdrop-blur-sm shadow-xl rounded-lg overflow-hidden">
                {post.imageUrl && (
                  <div className="relative h-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = `https://placehold.co/800x600/2a2a2a/ffffff.jpg?text=${encodeURIComponent(post.title)}`;
                      }}
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {post.content.length > 150
                      ? `${post.content.substring(0, 150)}...`
                      : post.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {post.author?.name || 'Unknown Author'}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center mt-4 ${
                      isPostLiked(post)
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-gray-400 hover:text-gray-300'
                    } transition-colors duration-300 text-sm`}
                    title={user ? 'Like/Unlike post' : 'Login to like posts'}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill={isPostLiked(post) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                    >
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
} 