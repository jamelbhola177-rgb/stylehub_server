import './env.js';
import { v2 as cloudinary } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn('Warning: Cloudinary credentials missing. Image uploads will fail.');
} else {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
}

export const isCloudinaryConfigured = () =>
  Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

export const uploadToCloudinary = (fileBuffer, options = {}) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      reject(new Error('Cloudinary is not configured. Add credentials to server/.env'));
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'stylehub/products',
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(fileBuffer);
  });

export const deleteFromCloudinary = (publicId) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
