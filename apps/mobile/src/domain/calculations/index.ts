/**
 * Domain Calculations
 *
 * Pure functions for frame extraction calculations.
 */

// FPS Calculations
export {
  calculateUniformSamplingFps,
  calculateIntervalBasedFps,
  calculateFrameBasedFps,
  calculateExtractionFps,
  estimateFrameCount,
} from './fpsCalculations';

// Storage Estimation
export {
  estimateFrameStorageSize,
  estimateTotalStorageSize,
  estimateProcessingDuration,
} from './storageEstimation';

// Frame Timestamps
export {
  calculateFrameTimestamp,
  generateFrameInfos,
  calculateActualStorageSize,
} from './frameTimestamps';
