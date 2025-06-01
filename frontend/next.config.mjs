/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blog-app-backend-qy4q.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'blog-app-backend-qy4q.onrender.com',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      }
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/blogs/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://blog-app-backend-qy4q.onrender.com'}/api/blogs/:path*`
      },
      {
        source: '/api/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://blog-app-backend-qy4q.onrender.com'}/api/auth/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://blog-app-backend-qy4q.onrender.com'}/uploads/:path*`
      },
      {
        source: '/images/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://blog-app-backend-qy4q.onrender.com'}/images/:path*`
      }
    ]
  }
};

export default nextConfig; 