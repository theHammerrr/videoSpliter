import type { ValidationError } from '@domain/models';
import { VALIDATION_RULES, VALIDATION_ERROR_CODES } from '../validationRules';

/**
 * Validate quality parameter
 *
 * Quality must be between 1 and 31 (inclusive).
 * Lower values = higher quality.
 *
 * @param quality - Quality value to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateQuality(quality: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(quality)) {
    errors.push({
      field: 'quality',
      message: 'Quality must be a valid number',
      code: VALIDATION_ERROR_CODES.INVALID_QUALITY,
    });
    return errors;
  }

  if (quality < VALIDATION_RULES.MIN_QUALITY || quality > VALIDATION_RULES.MAX_QUALITY) {
    errors.push({
      field: 'quality',
      message: `Quality must be between ${VALIDATION_RULES.MIN_QUALITY} and ${VALIDATION_RULES.MAX_QUALITY}`,
      code: VALIDATION_ERROR_CODES.QUALITY_OUT_OF_RANGE,
    });
  }

  return errors;
}

/**
 * Validate non-empty string
 *
 * Ensures a string field is not empty or whitespace-only.
 *
 * @param value - String value to validate
 * @param fieldName - Name of the field for error messages
 * @returns Array of validation errors (empty if valid)
 */
export function validateNonEmptyString(value: string, fieldName: string): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof value !== 'string') {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be a string`,
      code: VALIDATION_ERROR_CODES.INVALID_VALUE,
    });
    return errors;
  }

  if (value.trim().length === 0) {
    errors.push({
      field: fieldName,
      message: `${fieldName} cannot be empty`,
      code: VALIDATION_ERROR_CODES.EMPTY_PATH,
    });
  }

  return errors;
}

/**
 * Validate video path
 *
 * Ensures video path is a non-empty string.
 * Platform-specific path validation is handled by adapters.
 *
 * @param videoPath - Video path to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateVideoPath(videoPath: string): ValidationError[] {
  return validateNonEmptyString(videoPath, 'videoPath');
}

/**
 * Validate output directory
 *
 * Ensures output directory is a non-empty string.
 * Platform-specific directory validation is handled by adapters.
 *
 * @param outputDirectory - Output directory to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateOutputDirectory(outputDirectory: string): ValidationError[] {
  return validateNonEmptyString(outputDirectory, 'outputDirectory');
}
