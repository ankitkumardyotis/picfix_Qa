// Centralized Public URL Utility
// Replaces slow signed URL generation with instant public URLs

const PUBLIC_BUCKET_URL = process.env.PUBLIC_BUCKET_URL || 'https://picfixcdn.com';

/**
 * Generate public URL for any image path in R2 bucket
 * This is instant and doesn't require S3 API calls
 * @param {string} imagePath - The path/key of the image in R2 bucket
 * @returns {string} - Direct public URL to the image
 */
export function generatePublicUrl(imagePath) {
  if (!imagePath) {
    console.warn('generatePublicUrl: No image path provided');
    return null;
  }
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  const publicUrl = `${PUBLIC_BUCKET_URL}/${cleanPath}`;
  return publicUrl;
}

/**
 * Get model display name for UI
 * @param {string} model - Model identifier
 * @returns {string} - Human readable model name
 */
export function getModelDisplayName(model) {
  const modelNames = {
    'generate-image': 'AI Image Generator',
    'hair-style': 'Hair Style Editor', 
    'headshot': 'Headshot Generator',
    'restore-image': 'Photo Restoration',
    'text-removal': 'Text Removal',
    're-imagine': 'Reimagine',
    'combine-image': 'Image Combiner',
    'background-removal': 'Background Removal',
    'trendy-look': 'Trendy Look',
    'room-design': 'Room Design'
  };
  
  return modelNames[model] || model.charAt(0).toUpperCase() + model.slice(1);
}

export default { generatePublicUrl, getModelDisplayName }; 