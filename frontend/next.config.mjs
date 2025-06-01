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
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['res.cloudinary.com', 'blog-app-backend-qy4q.onrender.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://blog-app-backend-qy4q.onrender.com',
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
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
};

export default nextConfig; 