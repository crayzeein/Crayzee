import API from './api';

/**
 * Generate AI Virtual Try-On
 * @param {string} productId - The product ID to try on
 * @param {File} imageFile - User's photo file
 * @param {function} onProgress - Optional progress callback
 * @returns {Promise<{resultImage: string, remaining: number, message: string}>}
 */
export const generateTryOn = async (productId, imageFile) => {
  const formData = new FormData();
  formData.append('productId', productId);
  formData.append('userPhoto', imageFile);

  const response = await API.post('/tryon/generate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000, // 3 minutes timeout (HuggingFace free tier can be slow)
  });

  return response.data;
};
