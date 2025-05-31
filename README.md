# Full-Stack Blog Application

A modern blog application built with Next.js, Node.js, Express, and MongoDB.

## Features

- User authentication (register/login)
- Create, read, update, and delete blog posts
- Responsive design with Tailwind CSS
- Image upload functionality
- Secure API with JWT authentication
- MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Project Structure

```
.
├── frontend/           # Next.js frontend application
│   ├── src/           # Source files
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
└── backend/           # Express.js backend application
    ├── models/        # Database models
    ├── routes/        # API routes
    ├── middleware/    # Custom middleware
    └── package.json   # Backend dependencies
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd blog-application
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

4. Set up environment variables:
   - Create `.env` in the backend directory:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/blog
     JWT_SECRET=your_jwt_secret
     ```
   - Create `.env.local` in the frontend directory:
     ```
     NEXT_PUBLIC_API_URL=http://localhost:5000
     ```

5. Start the development servers:
   - Backend:
     ```bash
     cd backend
     npm run dev
     ```
   - Frontend:
     ```bash
     cd frontend
     npm run dev
     ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- Authentication:
  - POST `/api/auth/register` - Register new user
  - POST `/api/auth/login` - Login user

- Blog Posts:
  - GET `/api/posts` - Get all posts
  - GET `/api/posts/:id` - Get single post
  - POST `/api/posts` - Create new post
  - PUT `/api/posts/:id` - Update post
  - DELETE `/api/posts/:id` - Delete post

## Technologies Used

- **Frontend:**
  - Next.js 13
  - TypeScript
  - Tailwind CSS
  - Axios
  - Context API for state management

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication
  - Multer for file uploads

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 