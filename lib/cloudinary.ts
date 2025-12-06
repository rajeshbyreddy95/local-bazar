import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImageToCloudinary = async (
  fileData: string
): Promise<{ url: string; publicId: string }> => {
  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder: 'local-bazar/products',
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

export const deleteMultipleImagesFromCloudinary = async (publicIds: string[]): Promise<void> => {
  try {
    await Promise.all(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)));
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    throw new Error('Failed to delete images from Cloudinary');
  }
};
