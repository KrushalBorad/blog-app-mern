const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

// Create a new blog post with image upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Create post request:', {
      body: req.body,
      file: req.file,
      user: req.user
    });

    // Validate required fields
    if (!req.body.title || !req.body.content) {
      console.log('Missing required fields:', { title: !!req.body.title, content: !!req.body.content });
      return res.status(400).json({ 
        message: 'Title and content are required' 
      });
    }

    let imageUrl = '/images/default-blog.jpg'; // Default image
    
    if (req.file) {
      // Create URL for the uploaded file
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('Image uploaded successfully:', { url: imageUrl });
    }

    // Create blog with the user ID from auth middleware
    const blog = new Blog({
      title: req.body.title,
      content: req.body.content,
      imageUrl: imageUrl,
      author: req.user.id
    });

    console.log('Creating blog post:', blog);

    const savedBlog = await blog.save();
    console.log('Blog saved successfully:', savedBlog);

    // Populate author details before sending response
    const populatedBlog = await Blog.findById(savedBlog._id).populate('author', 'name email');
    res.status(201).json(populatedBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }
    res.status(500).json({ 
      message: 'Error creating blog post', 
      error: error.message 
    });
  }
});

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ blogs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
});

// Get saved posts for the current user
router.get('/saved', auth, async (req, res) => {
  try {
    const blogs = await Blog.find({ savedBy: req.user.id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({ message: 'Error fetching saved posts', error: error.message });
  }
});

// Toggle save post
router.post('/:id/toggle-save', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userId = req.user.id;
    const savedIndex = blog.savedBy.indexOf(userId);

    // If user already saved, remove save
    if (savedIndex !== -1) {
      blog.savedBy.splice(savedIndex, 1);
    } else {
      // Add save
      blog.savedBy.push(userId);
    }

    await blog.save();
    res.json(blog);
  } catch (error) {
    console.error('Error in toggle save route:', error);
    res.status(500).json({ message: 'Error updating saved status', error: error.message });
  }
});

// Get a single blog post
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name email');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog', error: error.message });
  }
});

// Update a blog post
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    let imageUrl = blog.imageUrl;
    if (req.file) {
      // If there's an existing image, delete it (except default image)
      if (blog.imageUrl && !blog.imageUrl.includes('default-blog.jpg')) {
        const oldImagePath = path.join(__dirname, '../public', blog.imageUrl);
        try {
          require('fs').unlinkSync(oldImagePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }

      // Update with new image URL
      imageUrl = `/uploads/${req.file.filename}`;
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    blog.imageUrl = imageUrl;

    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
});

// Delete a blog post
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Get the author ID, handling both populated and unpopulated cases
    const authorId = blog.author._id ? blog.author._id.toString() : blog.author.toString();
    const userId = req.user.id.toString();

    console.log('Delete authorization check:', {
      authorId,
      userId,
      authorType: typeof blog.author,
      isPopulated: !!blog.author._id,
      isMatch: authorId === userId
    });

    if (authorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    // Delete the image file if it exists (except default image)
    if (blog.imageUrl && !blog.imageUrl.includes('default-blog.jpg')) {
      const imagePath = path.join(__dirname, '../public', blog.imageUrl);
      try {
        require('fs').unlinkSync(imagePath);
      } catch (err) {
        console.error('Error deleting image file:', err);
      }
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error in delete blog route:', error);
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
});

// Like/Unlike a blog post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userId = req.user.id;
    const userLikedIndex = blog.likes.indexOf(userId);

    // If user already liked, remove like (unlike)
    if (userLikedIndex !== -1) {
      blog.likes.splice(userLikedIndex, 1);
    } else {
      // Add like
      blog.likes.push(userId);
    }

    await blog.save();
    res.json({ likes: blog.likes });
  } catch (error) {
    console.error('Error in like/unlike route:', error);
    res.status(500).json({ message: 'Error updating likes', error: error.message });
  }
});

module.exports = router; 