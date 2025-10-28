/**
 * Utility to dynamically recolor Lottie animations
 */

/**
 * Lottie RGBA color in 0-1 range [R, G, B, A]
 */
type LottieRgbaColor = [number, number, number, number];

/**
 * Lottie color property structure
 */
interface LottieColorProperty {
  a?: number;
  k: LottieRgbaColor | unknown;
  ix?: number;
}

/**
 * Generic Lottie animation data structure
 * Using Record for flexibility with deeply nested objects
 */
type LottieAnimationData = Record<string, unknown>;

/**
 * Type guard to check if an object has a Lottie color property
 */
function hasColorProperty(obj: unknown): obj is { c: LottieColorProperty } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "c" in obj &&
    typeof obj.c === "object" &&
    obj.c !== null &&
    "k" in obj.c &&
    Array.isArray(obj.c.k)
  );
}

/**
 * Convert hex color to RGB array in 0-1 range for Lottie
 */
export function hexToLottieRgb(hex: string): LottieRgbaColor {
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
function replaceColorsRecursive(
  obj: unknown,
  newColor: LottieRgbaColor
): void {
  if (typeof obj !== "object" || obj === null) return;

  // Check if this object has a color property using type guard
  if (hasColorProperty(obj)) {
    // Replace the color array
    obj.c.k = newColor;
  }

  // Recursively process all properties
  for (const key in obj as Record<string, unknown>) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const record = obj as Record<string, unknown>;
      replaceColorsRecursive(record[key], newColor);
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
  animationData: LottieAnimationData,
  hexColor: string
): LottieAnimationData {
  // Deep clone the animation data to avoid mutating the original
  const cloned = JSON.parse(JSON.stringify(animationData)) as LottieAnimationData;

  // Convert hex to Lottie RGB format
  const lottieColor = hexToLottieRgb(hexColor);

  // Replace all colors recursively
  replaceColorsRecursive(cloned, lottieColor);

  return cloned;
}
