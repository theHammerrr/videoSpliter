/**
 * Storage Estimation
 *
 * Estimates storage size for extracted frames based on resolution, quality, and frame count.
 *
 * Uses empirical JPEG compression ratios with safety margins to provide conservative estimates.
 */

/**
 * JPEG compression ratio estimates based on quality parameter
 *
 * Quality parameter (1-31):
 * - Lower values = higher quality, lower compression
 * - Higher values = lower quality, higher compression
 *
 * Compression ratio is the ratio of compressed size to uncompressed size.
 */
const JPEG_COMPRESSION_RATIOS: Record<number, number> = {
  // High quality (1-2)
  1: 0.15, // ~15% of uncompressed size
  2: 0.12,

  // Medium-high quality (3-5)
  3: 0.1,
  4: 0.08,
  5: 0.07,

  // Medium quality (6-10)
  6: 0.06,
  7: 0.05,
  8: 0.045,
  9: 0.04,
  10: 0.035,

  // Medium-low quality (11-15)
  11: 0.03,
  12: 0.028,
  13: 0.026,
  14: 0.024,
  15: 0.022,

  // Low quality (16-31)
  16: 0.02,
  17: 0.019,
  18: 0.018,
  19: 0.017,
  20: 0.016,
  21: 0.015,
  22: 0.014,
  23: 0.013,
  24: 0.012,
  25: 0.011,
  26: 0.01,
  27: 0.009,
  28: 0.008,
  29: 0.007,
  30: 0.006,
  31: 0.005,
};

/**
 * Safety margin multiplier for storage estimates
 *
 * Applied to account for variation in JPEG compression based on image content.
 * Simple scenes compress better; complex scenes compress worse.
 */
const SAFETY_MARGIN = 1.5;

/**
 * Get compression ratio for a given quality level
 *
 * @param quality - Quality parameter (1-31)
 * @returns Compression ratio (0-1)
 */
function getCompressionRatio(quality: number): number {
  // Clamp quality to valid range
  const clampedQuality = Math.max(1, Math.min(31, Math.round(quality)));

  return JPEG_COMPRESSION_RATIOS[clampedQuality] ?? 0.1;
}

/**
 * Estimate storage size for a single frame
 *
 * @param width - Frame width in pixels
 * @param height - Frame height in pixels
 * @param quality - JPEG quality (1-31, lower = higher quality)
 * @returns Estimated storage size in megabytes
 *
 * @example
 * estimateFrameStorageSize(1920, 1080, 2) // ~0.5 MB (high quality 1080p)
 * estimateFrameStorageSize(1280, 720, 10) // ~0.08 MB (medium quality 720p)
 * estimateFrameStorageSize(3840, 2160, 5) // ~1.2 MB (medium-high quality 4K)
 */
export function estimateFrameStorageSize(width: number, height: number, quality: number): number {
  if (width <= 0 || height <= 0) {
    throw new Error('Width and height must be greater than 0');
  }

  if (quality < 1 || quality > 31) {
    throw new Error('Quality must be between 1 and 31');
  }

  // Calculate uncompressed size in bytes
  // RGB image: width × height × 3 bytes per pixel
  const uncompressedBytes = width * height * 3;

  // Apply compression ratio
  const compressionRatio = getCompressionRatio(quality);
  const compressedBytes = uncompressedBytes * compressionRatio;

  // Apply safety margin
  const estimatedBytes = compressedBytes * SAFETY_MARGIN;

  // Convert to megabytes
  const megabytes = estimatedBytes / (1024 * 1024);

  return megabytes;
}

/**
 * Estimate total storage size for all frames
 *
 * @param frameCount - Number of frames to extract
 * @param width - Frame width in pixels
 * @param height - Frame height in pixels
 * @param quality - JPEG quality (1-31, lower = higher quality)
 * @returns Estimated total storage size in megabytes
 *
 * @example
 * estimateTotalStorageSize(100, 1920, 1080, 2) // ~50 MB (100 high-quality 1080p frames)
 * estimateTotalStorageSize(30, 1280, 720, 10) // ~2.4 MB (30 medium-quality 720p frames)
 */
export function estimateTotalStorageSize(
  frameCount: number,
  width: number,
  height: number,
  quality: number,
): number {
  if (frameCount < 0) {
    throw new Error('Frame count cannot be negative');
  }

  if (frameCount === 0) {
    return 0;
  }

  // Calculate size per frame
  const sizePerFrame = estimateFrameStorageSize(width, height, quality);

  // Multiply by frame count
  return sizePerFrame * frameCount;
}

/**
 * Estimate processing duration in milliseconds
 *
 * Rough estimate based on frame count and typical extraction speed.
 * Actual duration varies significantly based on:
 * - Device performance
 * - Video codec
 * - Resolution
 * - Storage speed
 *
 * This provides a very rough baseline estimate.
 *
 * @param frameCount - Number of frames to extract
 * @returns Estimated processing duration in milliseconds
 *
 * @example
 * estimateProcessingDuration(100) // ~10000 ms (10 seconds for 100 frames)
 * estimateProcessingDuration(30) // ~3000 ms (3 seconds for 30 frames)
 */
export function estimateProcessingDuration(frameCount: number): number {
  if (frameCount < 0) {
    throw new Error('Frame count cannot be negative');
  }

  if (frameCount === 0) {
    return 0;
  }

  // Baseline: ~100ms per frame on average device
  // This is very conservative and device-dependent
  const msPerFrame = 100;

  return frameCount * msPerFrame;
}
