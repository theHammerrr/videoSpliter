import type { FrameExtractionRequest, ValidationResult, ValidationError } from '@domain/models';
import { createValidResult, createInvalidResultFromArray } from '@domain/models';
import { validateStrategy } from './validators/strategyValidators';
import {
  validateQuality,
  validateVideoPath,
  validateOutputDirectory,
} from './validators/parameterValidators';
import { VALIDATION_RULES } from './validationRules';

/**
 * Validate frame extraction request
 *
 * Validates all aspects of a frame extraction request:
 * - Video path is not empty
 * - Output directory is not empty
 * - Extraction strategy parameters are valid
 * - Quality parameter is valid (if provided)
 *
 * @param request - Frame extraction request to validate
 * @returns Validation result (valid: true or valid: false with errors)
 *
 * @example
 * const request = {
 *   videoPath: '/path/to/video.mp4',
 *   outputDirectory: '/path/to/output',
 *   strategy: { type: 'uniform', frameCount: 100 },
 *   quality: 2
 * };
 * const result = validateRequest(request);
 * if (result.valid) {
 *   // Proceed with extraction
 * } else {
 *   // Handle errors: result.errors
 * }
 */
export function validateRequest(request: FrameExtractionRequest): ValidationResult {
  const errors: ValidationError[] = [];

  // Validate video path
  errors.push(...validateVideoPath(request.videoPath));

  // Validate output directory
  errors.push(...validateOutputDirectory(request.outputDirectory));

  // Validate strategy
  errors.push(...validateStrategy(request.strategy));

  // Validate quality (if provided)
  if (request.quality !== undefined) {
    errors.push(...validateQuality(request.quality));
  }

  // Return result
  if (errors.length === 0) {
    return createValidResult();
  }

  return createInvalidResultFromArray(errors);
}

/**
 * Validate extraction plan storage estimate
 *
 * Ensures the estimated storage size doesn't exceed limits.
 *
 * @param estimatedStorageMB - Estimated storage in megabytes
 * @returns Array of validation errors (empty if valid)
 */
export function validateStorageEstimate(estimatedStorageMB: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(estimatedStorageMB)) {
    return errors; // Skip validation if estimate is invalid
  }

  if (estimatedStorageMB > VALIDATION_RULES.MAX_ESTIMATED_STORAGE_MB) {
    errors.push({
      field: 'estimatedStorageMB',
      message: `Estimated storage (${estimatedStorageMB.toFixed(0)}MB) exceeds limit of ${
        VALIDATION_RULES.MAX_ESTIMATED_STORAGE_MB
      }MB`,
      code: 'STORAGE_LIMIT_EXCEEDED',
    });
  }

  return errors;
}
