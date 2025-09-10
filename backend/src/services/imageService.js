const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5 // Maximum 5 files per upload
  }
});

// Process and save image
const processAndSaveImage = async (buffer, filename, options = {}) => {
  try {
    const {
      width = 600,
      height = 450,
      quality = 85,
      format = 'jpeg'
    } = options;

    // Process image with sharp - maintain aspect ratio, fit within bounds
    let processedImage = sharp(buffer)
      .resize(width, height, {
        fit: 'inside',           // Maintains aspect ratio, fits within dimensions
        withoutEnlargement: true // Don't enlarge small images
      })
      .jpeg({ 
        quality,
        progressive: true,       // Better loading for web
        mozjpeg: true           // Better compression
      });

    if (format === 'png') {
      processedImage = processedImage.png();
    } else if (format === 'webp') {
      processedImage = processedImage.webp({ quality });
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${Date.now()}.${format}`;
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const fullPath = path.join(uploadPath, uniqueFilename);

    // Ensure upload directory exists
    await fs.mkdir(uploadPath, { recursive: true });

    // Save processed image
    await processedImage.toFile(fullPath);

    // Generate thumbnail
    const thumbnailFilename = `thumb-${uniqueFilename}`;
    const thumbnailPath = path.join(uploadPath, thumbnailFilename);
    
    await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        withoutEnlargement: true
      })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);

    return {
      original: uniqueFilename,
      thumbnail: thumbnailFilename,
      path: fullPath,
      thumbnailPath: thumbnailPath
    };

  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

// Upload single image
const uploadSingleImage = upload.single('image');

// Upload multiple images
const uploadMultipleImages = upload.array('images', 5);

// Delete image file
const deleteImageFile = async (filename) => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const imagePath = path.join(uploadPath, filename);
    const thumbnailPath = path.join(uploadPath, `thumb-${filename}`);

    // Delete original image
    try {
      await fs.unlink(imagePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error deleting original image:', error);
      }
    }

    // Delete thumbnail
    try {
      await fs.unlink(thumbnailPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error deleting thumbnail:', error);
      }
    }

    return true;
  } catch (error) {
    console.error('Error deleting image files:', error);
    return false;
  }
};

// Get image info
const getImageInfo = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    return null;
  }
};

// Validate image dimensions
const validateImageDimensions = (width, height, minWidth = 100, minHeight = 100, maxWidth = 4000, maxHeight = 4000) => {
  if (width < minWidth || height < minHeight) {
    throw new Error(`Image dimensions too small. Minimum: ${minWidth}x${minHeight}`);
  }
  
  if (width > maxWidth || height > maxHeight) {
    throw new Error(`Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}`);
  }
  
  return true;
};

// Generate image URL
const generateImageUrl = (filename, type = 'original') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const prefix = type === 'thumbnail' ? 'thumb-' : '';
  return `${baseUrl}/uploads/${prefix}${filename}`;
};

// Clean up orphaned images
const cleanupOrphanedImages = async () => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    const files = await fs.readdir(uploadPath);
    
    for (const file of files) {
      if (file.startsWith('thumb-')) continue; // Skip thumbnails
      
      const filePath = path.join(uploadPath, file);
      const stats = await fs.stat(filePath);
      
      // Delete files older than 24 hours
      const hoursSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceModified > 24) {
        await deleteImageFile(file);
        console.log(`Deleted orphaned image: ${file}`);
      }
    }
    
    console.log('Image cleanup completed');
  } catch (error) {
    console.error('Image cleanup error:', error);
  }
};

module.exports = {
  upload,
  uploadSingleImage,
  uploadMultipleImages,
  processAndSaveImage,
  deleteImageFile,
  getImageInfo,
  validateImageDimensions,
  generateImageUrl,
  cleanupOrphanedImages
}; 