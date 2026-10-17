const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Ensure local uploads directory exists for fallback
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME.trim() !== ''
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Allowed file types filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|pdf/;
  const extname = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = /image\/(jpeg|png|jpg)|application\/pdf/.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'), false);
  }
};

let storage;

if (isCloudinaryConfigured()) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'warranty_tracker_docs',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    },
  });
} else {
  // Local disk storage fallback
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${uniqueSuffix}-${safeName}`);
    },
  });
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: fileFilter,
});

/**
 * Helper to delete a file from either Cloudinary or local disk
 */
const deleteFile = async (fileUrl, publicId) => {
  try {
    if (publicId && isCloudinaryConfigured()) {
      await cloudinary.uploader.destroy(publicId);
      return true;
    }
    
    // Check if it's a local file
    if (fileUrl && fileUrl.includes('/uploads/')) {
      const filename = path.basename(fileUrl);
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('[File Deletion Error]:', error.message);
    return false;
  }
};

module.exports = {
  upload,
  deleteFile,
  isCloudinaryConfigured,
};
