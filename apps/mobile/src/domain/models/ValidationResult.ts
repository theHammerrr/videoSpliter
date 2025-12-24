/**
 * Validation Error
 *
 * Represents a single validation error with field, message, and code.
 */
export interface ValidationError {
  /**
   * Field name that failed validation
   *
   * @example
   * 'frameCount', 'intervalSeconds', 'videoPath'
   */
  readonly field: string;

  /**
   * Human-readable error message
   *
   * @example
   * 'Frame count must be between 1 and 10000'
   * 'Interval must be at least 0.001 seconds'
   */
  readonly message: string;

  /**
   * Error code for programmatic handling
   *
   * @example
   * 'INVALID_FRAME_COUNT', 'INVALID_INTERVAL', 'INVALID_PATH'
   */
  readonly code: string;
}

/**
 * Validation Result (Discriminated Union)
 *
 * Represents the result of validation - either valid or invalid with errors.
 */
export type ValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly errors: readonly ValidationError[] };

/**
 * Type guard to check if validation passed
 */
export function isValid(result: ValidationResult): result is { valid: true } {
  return result.valid === true;
}

/**
 * Type guard to check if validation failed
 */
export function isInvalid(
  result: ValidationResult,
): result is { valid: false; errors: readonly ValidationError[] } {
  return result.valid === false;
}

/**
 * Helper to create a valid validation result
 */
export function createValidResult(): ValidationResult {
  return { valid: true };
}

/**
 * Helper to create an invalid validation result from errors
 */
export function createInvalidResult(errors: readonly ValidationError[]): ValidationResult {
  return { valid: false, errors };
}

/**
 * Helper to create an invalid validation result from an error array
 */
export function createInvalidResultFromArray(errors: ValidationError[]): ValidationResult {
  return { valid: false, errors };
}
