/**
 * Validation Rules
 *
 * Constants and limits for validating extraction requests.
 */

/**
 * Validation rule constants
 */
export const VALIDATION_RULES = {
  // Frame count limits (uniform sampling)
  MIN_FRAME_COUNT: 1,
  MAX_FRAME_COUNT: 10000,

  // Interval limits (interval-based strategy)
  MIN_INTERVAL_SECONDS: 0.001, // 1ms minimum
  MAX_INTERVAL_SECONDS: 3600, // 1 hour maximum

  // Frame interval limits (frame-based strategy)
  MIN_FRAME_INTERVAL: 1,
  MAX_FRAME_INTERVAL: 1000,

  // FPS limits (custom-fps strategy)
  MIN_FPS: 0.001, // Very slow extraction
  MAX_FPS: 120, // Standard video max

  // Quality limits
  MIN_QUALITY: 1, // Highest quality
  MAX_QUALITY: 31, // Lowest quality
  DEFAULT_QUALITY: 2,

  // Storage limits
  MAX_ESTIMATED_STORAGE_MB: 5000, // 5GB max
} as const;

/**
 * Validation error codes
 */
export const VALIDATION_ERROR_CODES = {
  // Generic
  INVALID_VALUE: 'INVALID_VALUE',
  REQUIRED_FIELD: 'REQUIRED_FIELD',

  // Frame count
  INVALID_FRAME_COUNT: 'INVALID_FRAME_COUNT',
  FRAME_COUNT_TOO_LOW: 'FRAME_COUNT_TOO_LOW',
  FRAME_COUNT_TOO_HIGH: 'FRAME_COUNT_TOO_HIGH',

  // Interval
  INVALID_INTERVAL: 'INVALID_INTERVAL',
  INTERVAL_TOO_LOW: 'INTERVAL_TOO_LOW',
  INTERVAL_TOO_HIGH: 'INTERVAL_TOO_HIGH',

  // Frame interval
  INVALID_FRAME_INTERVAL: 'INVALID_FRAME_INTERVAL',
  FRAME_INTERVAL_TOO_LOW: 'FRAME_INTERVAL_TOO_LOW',
  FRAME_INTERVAL_TOO_HIGH: 'FRAME_INTERVAL_TOO_HIGH',

  // FPS
  INVALID_FPS: 'INVALID_FPS',
  FPS_TOO_LOW: 'FPS_TOO_LOW',
  FPS_TOO_HIGH: 'FPS_TOO_HIGH',

  // Quality
  INVALID_QUALITY: 'INVALID_QUALITY',
  QUALITY_OUT_OF_RANGE: 'QUALITY_OUT_OF_RANGE',

  // Paths
  EMPTY_PATH: 'EMPTY_PATH',
  INVALID_VIDEO_PATH: 'INVALID_VIDEO_PATH',
  INVALID_OUTPUT_DIRECTORY: 'INVALID_OUTPUT_DIRECTORY',

  // Storage
  STORAGE_LIMIT_EXCEEDED: 'STORAGE_LIMIT_EXCEEDED',

  // Strategy
  UNKNOWN_STRATEGY: 'UNKNOWN_STRATEGY',
} as const;
