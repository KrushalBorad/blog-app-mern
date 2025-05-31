'use client';

import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
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

export default function BlogPost({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`${process.env.API_URL}/api/blogs/${params.id}`);
        setBlog(response.data);
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };

    fetchBlog();
  }, [params.id]);

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
          </div>
        </article>
      </div>
    </div>
  );
} 