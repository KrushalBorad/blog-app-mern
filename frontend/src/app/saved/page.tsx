'use client';

import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  author: {
    _id: string;
    name: string;
  };
  createdAt: string;
  likes: string[];
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
  const [savedPostsData, setSavedPostsData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, savedPosts, toggleSavePost } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchSavedPosts = async () => {
      try {
        const posts = await Promise.all(
          savedPosts.map(async (id) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${id}`);
            if (!response.ok) return null;
            return response.json();
          })
        );

        setSavedPostsData(posts.filter((post): post is BlogPost => post !== null));
      } catch (err) {
        console.error('Error fetching saved posts:', err);
        setError('Failed to load saved posts');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, [user, savedPosts, router]);

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to like post');
      }

      const data = await response.json();

      // Update posts state to reflect the new like
      setSavedPostsData(savedPostsData.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: data.likes
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gradient-to-r from-purple-600 to-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Saved Posts
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!savedPostsData || savedPostsData.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <p className="text-gray-600 text-xl mb-4">No saved posts yet.</p>
            <Link href="/" 
              className="inline-flex items-center text-purple-600 hover:text-pink-600 font-semibold transition-colors duration-300">
              <span>Browse Posts</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPostsData.map((post: BlogPost) => (
              <article
                key={post._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={getPostImage(post.title, post.imageUrl)}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-xl font-bold text-white line-clamp-2 hover:text-pink-100 transition-colors duration-300">
                      <Link href={`/blog/${post._id}`}>
                        {post.title}
                      </Link>
                    </h2>
                  </div>
                </div>

                <div className="p-4 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getProfileColor(post.author?.name || 'Unknown')} flex items-center justify-center text-white font-bold shadow-md`}>
                        {post.author?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800">{post.author?.name || 'Unknown Author'}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {post.content}
                  </p>

                  <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-100">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center ${
                          user && post.likes?.some(id => id?.toString() === user.id.toString())
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-gray-400 hover:text-gray-300'
                        } transition-colors duration-300 text-sm`}
                        title={user ? 'Like/Unlike post' : 'Login to like posts'}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill={user && post.likes?.some(id => id?.toString() === user.id.toString()) ? 'currentColor' : 'none'}
                          stroke="currentColor"
                        >
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        {post.likes?.filter(id => id != null).length || 0} {post.likes?.filter(id => id != null).length === 1 ? 'Like' : 'Likes'}
                      </button>
                      <Link
                        href={`/blog/${post._id}`}
                        className="flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-300 text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        Read
                      </Link>
                    </div>
                    <button
                      onClick={() => toggleSavePost(post._id)}
                      className="flex items-center text-pink-500 hover:text-pink-700 transition-colors duration-300 text-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        stroke="currentColor"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      Remove from Saved
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 