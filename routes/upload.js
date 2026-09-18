import express from 'express';
import multer from 'multer';
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { upload } from '../middleware/upload.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({ message: 'Cloudinary is not configured on the server. Check server/.env' });
    }

    const result = await uploadToCloudinary(req.file.buffer);
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Image upload failed' });
  }
});

router.post('/multiple', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({ message: 'Cloudinary is not configured on the server. Check server/.env' });
    }

    const uploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer))
    );

    res.json({
      images: uploads.map((r) => ({ url: r.secure_url, publicId: r.public_id })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Image upload failed' });
  }
});

router.delete('/:publicId', protect, admin, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await deleteFromCloudinary(publicId);
    res.json({ message: 'Image deleted from Cloudinary' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Delete failed' });
  }
});

router.use((error, _req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Image must be smaller than 5MB' });
    }
    return res.status(400).json({ message: error.message });
  }
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  next();
});

export default router;
