/**
 * Utility to dynamically recolor Lottie animations
 */

/**
 * Convert hex color to RGB array in 0-1 range for Lottie
 */
export function hexToLottieRgb(hex: string): [number, number, number, number] {
  // Remove # if present
  const cleanHex = hex.replace("#", "");

  // Parse hex values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  return [r, g, b, 1]; // Alpha always 1
}

/**
 * Recursively search and replace all color values in a Lottie JSON object
 */
function replaceColorsRecursive(obj: any, newColor: [number, number, number, number]): void {
  if (typeof obj !== "object" || obj === null) return;

  // Check if this object has a color property
  if (obj.c && obj.c.k && Array.isArray(obj.c.k)) {
    // Replace the color array
    obj.c.k = newColor;
  }

  // Recursively process all properties
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      replaceColorsRecursive(obj[key], newColor);
    }
  }
}

/**
 * Create a recolored copy of a Lottie animation
 * @param animationData - Original Lottie JSON data
 * @param hexColor - Hex color string (e.g., "#ff0000")
 * @returns Deep cloned and recolored animation data
 */
export function recolorLottieAnimation(
  animationData: any,
  hexColor: string
): any {
  // Deep clone the animation data to avoid mutating the original
  const cloned = JSON.parse(JSON.stringify(animationData));

  // Convert hex to Lottie RGB format
  const lottieColor = hexToLottieRgb(hexColor);

  // Replace all colors recursively
  replaceColorsRecursive(cloned, lottieColor);

  return cloned;
}
