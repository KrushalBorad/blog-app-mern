const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Processing file upload:', {
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('Checking file type:', {
    mimetype: file.mimetype,
    originalname: file.originalname
  });

  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    console.log('Invalid file type:', file.mimetype);
    return cb(new Error('Only image files are allowed!'), false);
  }

  if (!file.mimetype.startsWith('image/')) {
    console.log('Invalid mime type:', file.mimetype);
    return cb(new Error('Only image files are allowed!'), false);
  }

  cb(null, true);
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('image');

// Wrap multer middleware to handle errors
const uploadMiddleware = (req, res, next) => {
  console.log('Starting file upload middleware');
  
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message });
    }

    console.log('File upload successful:', {
      file: req.file,
      body: req.body
    });
    
    next();
  });
};

module.exports = uploadMiddleware; 