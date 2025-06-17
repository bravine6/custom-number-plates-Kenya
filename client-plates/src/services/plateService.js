import api from './api';

/**
 * Get all plates
 * @param {string} type - Optional plate type filter
 * @returns {Promise} - API response
 */
export const getPlates = async (type) => {
  const response = await api.get('/plates', { params: { type } });
  return response.data;
};

/**
 * Get plate by ID
 * @param {string} id - Plate ID
 * @returns {Promise} - API response
 */
export const getPlateById = async (id) => {
  const response = await api.get(`/plates/${id}`);
  return response.data;
};

/**
 * Generate plate preview
 * @param {string} text - Plate text
 * @param {string} plateType - Plate type (special, standard_custom, prestige)
 * @returns {Promise} - API response with preview URL
 */
export const generatePlatePreview = async (text, plateType) => {
  const response = await api.post('/plates/preview', { text, plateType });
  return response.data;
};

/**
 * Check if a plate text is available
 * @param {string} text - Plate text to check
 * @returns {Promise} - API response with availability status
 */
export const checkPlateAvailability = async (text) => {
  try {
    const response = await api.get(`/plates/check-availability/${text}`);
    return response.data;
  } catch (error) {
    // In case of error, assume the plate is unavailable
    return {
      text,
      isAvailable: false,
      message: 'Error checking availability. Please try again.',
    };
  }
};