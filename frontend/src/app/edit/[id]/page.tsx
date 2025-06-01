'use client';

import ImageUpload from '@/components/ImageUpload';
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
}

export default function EditPost({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('Fetching post:', params.id);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${params.id}`);
        console.log('Post data:', response.data);
        
        setPost(response.data);
        setTitle(response.data.title);
        setContent(response.data.content);
      } catch (err) {
        console.error('Error fetching post:', err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch post');
        } else {
          setError('Failed to fetch post');
        }
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchPost();
    }
  }, [mounted, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      console.log('Sending update request:', {
        postId: params.id,
        title,
        content,
        hasImage: !!image
      });

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${params.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Update response:', response.data);

      // Show success message
      setSuccess('Post updated successfully!');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      console.error('Error updating post:', err);
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to update post');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900/50 backdrop-blur-sm shadow-xl rounded-lg p-6 sm:p-8 border border-purple-900/30">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">Edit Post</h1>
          
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
              {post?.imageUrl && !image && (
                <div className="mt-2">
                  <p className="text-sm text-gray-400">Current image:</p>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}${post.imageUrl}`}
                    alt="Current cover"
                    className="mt-2 max-h-40 rounded-lg"
                  />
                </div>
              )}
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
                {loading ? 'Updating...' : 'Update Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 