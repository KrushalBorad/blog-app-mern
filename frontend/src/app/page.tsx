'use client';

import { useAuth } from '@/context/AuthContext';
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

interface BlogResponse {
  blogs: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
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

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, savedPosts, toggleSavePost } = useAuth();
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      console.log('Received data:', data);
      setPosts(data.blogs || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (postId: string) => {
    if (!user) {
      setError('You must be logged in to delete posts');
      return;
    }

    // Find the post to check ownership
    const post = posts.find(p => p._id === postId);
    if (!post) {
      setError('Post not found');
      return;
    }

    // Check if user is the author
    const userIdStr = user.id.toString();
    const authorIdStr = post.author._id ? post.author._id.toString() : post.author.toString();
    
    console.log('Frontend delete check:', {
      userId: userIdStr,
      userIdType: typeof userIdStr,
      authorId: authorIdStr,
      authorIdType: typeof authorIdStr,
      rawUserId: user.id,
      rawAuthorId: post.author,
      isMatch: userIdStr === authorIdStr
    });

    if (userIdStr !== authorIdStr) {
      setError('You can only delete your own posts');
      return;
    }

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      console.log('Sending delete request:', {
        postId,
        userId: userIdStr,
        authorId: authorIdStr,
        token: token.substring(0, 20) + '...' // Only log part of the token for security
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Delete failed:', {
          status: response.status,
          data: data,
          postId,
          userId: userIdStr,
          authorId: authorIdStr
        });
        throw new Error(data.message || 'Failed to delete post');
      }

      // Remove the post from the local state
      setPosts(posts.filter(p => p._id !== postId));
      setError(''); // Clear any existing errors
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

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

      console.log('Liking/Unliking post:', {
        postId,
        userId: userIdStr,
        currentLikes: posts.find(p => p._id === postId)?.likes?.map(id => id?.toString())
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to like post');
      }

      // Update posts state to reflect the new like status
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            likes: data.likes || []
          };
        }
        return post;
      }));
      setError(''); // Clear any existing errors
    } catch (err) {
      console.error('Error liking post:', err);
      setError(err instanceof Error ? err.message : 'Failed to like post');
    }
  };

  const isPostLiked = (post: BlogPost) => {
    if (!user?.id || !post.likes) return false;
    const userIdStr = user.id.toString();
    return post.likes.some(id => id?.toString() === userIdStr);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Blog Posts
          </h1>
          {user && (
            <Link
              href="/create"
              className="bg-purple-900/50 hover:bg-purple-800/60 text-purple-300 px-6 py-3 rounded-lg font-semibold 
                transform hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]
                flex items-center gap-2"
            >
              <span>Create Post</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-lg mb-8 animate-fade-in text-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!posts || posts.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg transform hover:shadow-xl transition-all duration-300 border border-purple-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-400 text-xl mb-4">No blog posts yet.</p>
            {user && (
              <Link href="/create" 
                className="inline-flex items-center text-purple-400 hover:text-pink-400 font-semibold transition-colors duration-300">
                <span>Write your first post</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: BlogPost) => (
              <article
                key={post._id}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex flex-col border border-purple-900/30"
              >
                <div className="relative h-48 w-full">
                  <img
                    src={getPostImage(post.title, post.imageUrl)}
                    alt={post.title}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = `https://placehold.co/800x600/2a2a2a/ffffff.jpg?text=Blog+Post`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-xl font-bold text-white line-clamp-2 hover:text-purple-300 transition-colors duration-300">
                      <Link href={`/blog/${post._id}`}>
                        {post.title}
                      </Link>
                    </h2>
                  </div>
                </div>

                <div className="p-4 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]`}>
                        {post.author?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-300">{post.author?.name || 'Unknown Author'}</span>
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

                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                    {post.content}
                  </p>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-purple-900/30">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center ${
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
                        {post.likes?.filter(id => id != null).length || 0} {post.likes?.filter(id => id != null).length === 1 ? 'Like' : 'Likes'}
                      </button>
                      <Link
                        href={`/blog/${post._id}`}
                        className="flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-300 text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        Read
                      </Link>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user && (
                        <button
                          onClick={() => handleDelete(post._id)}
                          className={`flex items-center text-red-400 hover:text-red-300 transition-colors duration-300 text-sm ${
                            (post.author._id || post.author).toString() !== user.id.toString()
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          title={
                            (post.author._id || post.author).toString() === user.id.toString()
                              ? 'Delete post'
                              : 'You can only delete your own posts'
                          }
                          disabled={(post.author._id || post.author).toString() !== user.id.toString()}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Delete
                        </button>
                      )}
                      {user && (
                        <button
                          onClick={() => toggleSavePost(post._id)}
                          className={`flex items-center ${
                            savedPosts.includes(post._id)
                              ? 'text-pink-400 hover:text-pink-300'
                              : 'text-gray-400 hover:text-gray-300'
                          } transition-colors duration-300 text-sm`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill={savedPosts.includes(post._id) ? 'currentColor' : 'none'}
                            stroke="currentColor"
                          >
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                          {savedPosts.includes(post._id) ? 'Saved' : 'Save'}
                        </button>
                      )}
                    </div>
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