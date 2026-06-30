const multer = require('multer');
const path = require('path');

// Configure temporary disk storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Validate file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|webp|gif/;
  const extensionCheck = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeCheck = allowedFileTypes.test(file.mimetype);

  if (extensionCheck && mimeCheck) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Only JPEG, JPG, PNG, WEBP, and GIF images are allowed.'), false);
  }
};

// Instantiated upload filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit uploads to 5MB
  },
  fileFilter: fileFilter
});

module.exports = { upload };
