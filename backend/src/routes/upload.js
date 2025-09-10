const express = require('express');
const { auth, requireVerification } = require('../middleware/auth');
const { uploadSingleImage, uploadMultipleImages, processAndSaveImage, deleteImageFile } = require('../services/imageService');
const { query } = require('../config/database');

const router = express.Router();

// @route   POST /api/v1/upload/image
// @desc    Upload a single image
// @access  Private
router.post('/image', [
  auth,
  requireVerification,
  uploadSingleImage
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No image file provided'
        }
      });
    }

    // Process and save image
    const imageData = await processAndSaveImage(req.file.buffer, req.file.originalname, {
      width: 600,
      height: 450,
      quality: 85,
      format: 'jpeg'
    });

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        image: {
          filename: imageData.original,
          thumbnail: imageData.thumbnail,
          url: `/uploads/${imageData.original}`,
          thumbnailUrl: `/uploads/${imageData.thumbnail}`
        }
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload image. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/upload/images
// @desc    Upload multiple images
// @access  Private
router.post('/images', [
  auth,
  requireVerification,
  uploadMultipleImages
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No image files provided'
        }
      });
    }

    const uploadedImages = [];

    // Process each image
    for (const file of req.files) {
      try {
        const imageData = await processAndSaveImage(file.buffer, file.originalname, {
          width: 600,
          height: 450,
          quality: 85,
          format: 'jpeg'
        });

        uploadedImages.push({
          filename: imageData.original,
          thumbnail: imageData.thumbnail,
          url: `/uploads/${imageData.original}`,
          thumbnailUrl: `/uploads/${imageData.thumbnail}`
        });
      } catch (error) {
        console.error(`Failed to process image ${file.originalname}:`, error);
        // Continue with other images
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to upload any images'
        }
      });
    }

    res.json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      data: {
        images: uploadedImages
      }
    });

  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload images. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/upload/post-images
// @desc    Upload images for a specific post
// @access  Private
router.post('/post-images/:postId', [
  auth,
  requireVerification,
  uploadMultipleImages
], async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No image files provided'
        }
      });
    }

    // Check if user owns the post
    const postCheck = await query(`
      SELECT id FROM posts 
      WHERE id = $1 AND user_id = $2 AND is_active = true
    `, [postId, userId]);

    if (postCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to this post'
        }
      });
    }

    const uploadedImages = [];

    // Process each image
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      try {
        const imageData = await processAndSaveImage(file.buffer, file.originalname, {
          width: 600,
          height: 450,
          quality: 85,
          format: 'jpeg'
        });

        // Save image reference to database
        const imageResult = await query(`
          INSERT INTO post_images (post_id, image_url, image_order)
          VALUES ($1, $2, $3)
          RETURNING id, image_url, image_order
        `, [postId, imageData.original, i]);

        uploadedImages.push({
          id: imageResult.rows[0].id,
          filename: imageData.original,
          thumbnail: imageData.thumbnail,
          url: `/uploads/${imageData.original}`,
          thumbnailUrl: `/uploads/${imageData.thumbnail}`,
          order: imageResult.rows[0].image_order
        });
      } catch (error) {
        console.error(`Failed to process image ${file.originalname}:`, error);
        // Continue with other images
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to upload any images'
        }
      });
    }

    res.json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully for post`,
      data: {
        images: uploadedImages
      }
    });

  } catch (error) {
    console.error('Post image upload error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to upload images. Please try again.'
      }
    });
  }
});

// @route   DELETE /api/v1/upload/image/:filename
// @desc    Delete an image
// @access  Private
router.delete('/image/:filename', [
  auth,
  requireVerification
], async (req, res) => {
  try {
    const { filename } = req.params;
    const userId = req.user.id;

    // Check if image belongs to user's post
    const imageCheck = await query(`
      SELECT pi.id, p.user_id
      FROM post_images pi
      JOIN posts p ON pi.post_id = p.id
      WHERE pi.image_url = $1 AND p.user_id = $2
    `, [filename, userId]);

    if (imageCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to this image'
        }
      });
    }

    // Delete from database
    await query(`
      DELETE FROM post_images 
      WHERE id = $1
    `, [imageCheck.rows[0].id]);

    // Delete file from storage
    await deleteImageFile(filename);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete image. Please try again.'
      }
    });
  }
});

// @route   PUT /api/v1/upload/post-images/:postId/reorder
// @desc    Reorder images for a post
// @access  Private
router.put('/post-images/:postId/reorder', [
  auth,
  requireVerification
], async (req, res) => {
  try {
    const { postId } = req.params;
    const { imageOrder } = req.body; // Array of image IDs in new order
    const userId = req.user.id;

    if (!Array.isArray(imageOrder)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Image order must be an array'
        }
      });
    }

    // Check if user owns the post
    const postCheck = await query(`
      SELECT id FROM posts 
      WHERE id = $1 AND user_id = $2 AND is_active = true
    `, [postId, userId]);

    if (postCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to this post'
        }
      });
    }

    // Update image order
    for (let i = 0; i < imageOrder.length; i++) {
      await query(`
        UPDATE post_images 
        SET image_order = $1
        WHERE id = $2 AND post_id = $3
      `, [i, imageOrder[i], postId]);
    }

    res.json({
      success: true,
      message: 'Image order updated successfully'
    });

  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to reorder images. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/upload/post-images/:postId
// @desc    Get images for a specific post
// @access  Public
router.get('/post-images/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // Get post images
    const result = await query(`
      SELECT id, image_url, image_order, created_at
      FROM post_images
      WHERE post_id = $1
      ORDER BY image_order ASC
    `, [postId]);

    const images = result.rows.map(img => ({
      id: img.id,
      filename: img.image_url,
      url: `/uploads/${img.image_url}`,
      thumbnailUrl: `/uploads/thumb-${img.image_url}`,
      order: img.image_order,
      createdAt: img.created_at
    }));

    res.json({
      success: true,
      data: {
        images
      }
    });

  } catch (error) {
    console.error('Get post images error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch post images. Please try again.'
      }
    });
  }
});

module.exports = router; 