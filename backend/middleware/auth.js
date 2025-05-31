const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    let token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Remove Bearer prefix if it exists
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      console.log('Token verification:', {
        tokenData: verified,
        userId: verified.id,
        userIdType: typeof verified.id
      });
      
      // Ensure the user ID is properly set
      req.user = {
        id: verified.id.toString() // Convert to string to ensure consistency
      };
      
      console.log('User set in request:', {
        userId: req.user.id,
        userIdType: typeof req.user.id
      });
      
      next();
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error in authentication' });
  }
};

module.exports = auth; 