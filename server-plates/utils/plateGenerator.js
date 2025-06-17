/**
 * Utility to generate plate preview SVGs
 * In a production system, this would create actual images
 * For this demo, we just generate SVG strings
 */

/**
 * Generate a plate SVG preview
 * @param {string} text - The text to display on the plate
 * @param {string} plateType - Type of plate (special, standard_custom, prestige)
 * @returns {string} - SVG string of the plate
 */
const generatePlateSvg = (text, plateType) => {
  // Default plate dimensions
  const width = 400;
  const height = 150;
  
  // Base plate color based on type
  let bgColor = '#FFFFFF';
  let textColor = '#000000';
  let borderColor = '#000000';
  
  switch (plateType) {
    case 'special':
      bgColor = '#FFFFFF';
      textColor = '#000000';
      borderColor = '#007F5F'; // Green border
      break;
    case 'standard_custom':
      bgColor = '#F2F2F2';
      textColor = '#000000';
      borderColor = '#000000';
      break;
    case 'prestige':
      bgColor = '#E5E5E5';
      textColor = '#000000';
      borderColor = '#003B5C'; // Navy border
      break;
    default:
      // Default styling
      break;
  }
  
  // Create SVG string
  const svgString = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="${bgColor}" stroke="${borderColor}" stroke-width="10" rx="10" ry="10" />
      
      <!-- Kenya flag on left side -->
      <rect x="20" y="30" width="50" height="90" fill="#000000" />
      <rect x="30" y="40" width="30" height="20" fill="#FF0000" />
      <rect x="30" y="60" width="30" height="20" fill="#FFFFFF" />
      <rect x="30" y="80" width="30" height="20" fill="#009900" />
      <path d="M45,40 L45,100 M30,50 L60,50 M30,70 L60,70 M30,90 L60,90" stroke="#000000" stroke-width="1" />
      
      <!-- Plate text -->
      <text x="${width/2}" y="${height/2 + 15}" 
        font-family="Arial, sans-serif" 
        font-size="50" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="${textColor}">
        ${text}
      </text>
      
      <!-- NTSA identifier -->
      <text x="${width - 30}" y="${height - 20}" 
        font-family="Arial, sans-serif" 
        font-size="12" 
        text-anchor="end" 
        fill="#666666">
        NTSA KENYA
      </text>
    </svg>
  `;
  
  return svgString;
};

/**
 * Convert SVG to a data URL
 * @param {string} svg - SVG string
 * @returns {string} - Data URL for the SVG
 */
const svgToDataUrl = (svg) => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * Generate a preview URL for a plate
 * In a production system, this would create and save images
 * @param {string} text - The text to display on the plate
 * @param {string} plateType - Type of plate (special, standard_custom, prestige)
 * @returns {object} - Object with the preview URL and SVG
 */
const generatePlatePreview = (text, plateType) => {
  const svg = generatePlateSvg(text, plateType);
  const dataUrl = svgToDataUrl(svg);
  
  return {
    svg,
    dataUrl,
    // In a production system, this would be a URL to a saved image
    url: `/api/v1/plates/preview/${plateType}/${text}`,
  };
};

module.exports = {
  generatePlateSvg,
  svgToDataUrl,
  generatePlatePreview,
};