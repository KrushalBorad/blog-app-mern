/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    API_URL: process.env.API_URL || 'https://blog-app-backend-qy4q.onrender.com',
  },
  images: {
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
  async rewrites() {
    return [
      {
        source: '/api/blogs/:path*',
        destination: `${process.env.API_URL || 'https://blog-app-backend-qy4q.onrender.com'}/api/blogs/:path*`
      },
      {
        source: '/api/auth/:path*',
        destination: `${process.env.API_URL || 'https://blog-app-backend-qy4q.onrender.com'}/api/auth/:path*`
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.API_URL || 'https://blog-app-backend-qy4q.onrender.com'}/uploads/:path*`
      },
      {
        source: '/images/:path*',
        destination: `${process.env.API_URL || 'https://blog-app-backend-qy4q.onrender.com'}/images/:path*`
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
}

module.exports = nextConfig 