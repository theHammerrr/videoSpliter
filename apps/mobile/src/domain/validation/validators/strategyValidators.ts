import type { ValidationError, ExtractionStrategy } from '@domain/models';
import { VALIDATION_RULES, VALIDATION_ERROR_CODES } from '../validationRules';

/**
 * Validate uniform sampling strategy
 *
 * Frame count must be between MIN_FRAME_COUNT and MAX_FRAME_COUNT.
 *
 * @param frameCount - Number of frames to extract
 * @returns Array of validation errors (empty if valid)
 */
export function validateUniformSampling(frameCount: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(frameCount) || !Number.isInteger(frameCount)) {
    errors.push({
      field: 'frameCount',
      message: 'Frame count must be a valid integer',
      code: VALIDATION_ERROR_CODES.INVALID_FRAME_COUNT,
    });
    return errors;
  }

  if (frameCount < VALIDATION_RULES.MIN_FRAME_COUNT) {
    errors.push({
      field: 'frameCount',
      message: `Frame count must be at least ${VALIDATION_RULES.MIN_FRAME_COUNT}`,
      code: VALIDATION_ERROR_CODES.FRAME_COUNT_TOO_LOW,
    });
  }

  if (frameCount > VALIDATION_RULES.MAX_FRAME_COUNT) {
    errors.push({
      field: 'frameCount',
      message: `Frame count cannot exceed ${VALIDATION_RULES.MAX_FRAME_COUNT}`,
      code: VALIDATION_ERROR_CODES.FRAME_COUNT_TOO_HIGH,
    });
  }

  return errors;
}

/**
 * Validate interval-based strategy
 *
 * Interval must be between MIN_INTERVAL_SECONDS and MAX_INTERVAL_SECONDS.
 *
 * @param intervalSeconds - Time interval between frames in seconds
 * @returns Array of validation errors (empty if valid)
 */
export function validateIntervalBased(intervalSeconds: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(intervalSeconds)) {
    errors.push({
      field: 'intervalSeconds',
      message: 'Interval must be a valid number',
      code: VALIDATION_ERROR_CODES.INVALID_INTERVAL,
    });
    return errors;
  }

  if (intervalSeconds < VALIDATION_RULES.MIN_INTERVAL_SECONDS) {
    errors.push({
      field: 'intervalSeconds',
      message: `Interval must be at least ${VALIDATION_RULES.MIN_INTERVAL_SECONDS} seconds`,
      code: VALIDATION_ERROR_CODES.INTERVAL_TOO_LOW,
    });
  }

  if (intervalSeconds > VALIDATION_RULES.MAX_INTERVAL_SECONDS) {
    errors.push({
      field: 'intervalSeconds',
      message: `Interval cannot exceed ${VALIDATION_RULES.MAX_INTERVAL_SECONDS} seconds`,
      code: VALIDATION_ERROR_CODES.INTERVAL_TOO_HIGH,
    });
  }

  return errors;
}

/**
 * Validate frame-based strategy
 *
 * Frame interval must be between MIN_FRAME_INTERVAL and MAX_FRAME_INTERVAL.
 *
 * @param frameInterval - Extract every Nth frame
 * @returns Array of validation errors (empty if valid)
 */
export function validateFrameBased(frameInterval: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(frameInterval) || !Number.isInteger(frameInterval)) {
    errors.push({
      field: 'frameInterval',
      message: 'Frame interval must be a valid integer',
      code: VALIDATION_ERROR_CODES.INVALID_FRAME_INTERVAL,
    });
    return errors;
  }

  if (frameInterval < VALIDATION_RULES.MIN_FRAME_INTERVAL) {
    errors.push({
      field: 'frameInterval',
      message: `Frame interval must be at least ${VALIDATION_RULES.MIN_FRAME_INTERVAL}`,
      code: VALIDATION_ERROR_CODES.FRAME_INTERVAL_TOO_LOW,
    });
  }

  if (frameInterval > VALIDATION_RULES.MAX_FRAME_INTERVAL) {
    errors.push({
      field: 'frameInterval',
      message: `Frame interval cannot exceed ${VALIDATION_RULES.MAX_FRAME_INTERVAL}`,
      code: VALIDATION_ERROR_CODES.FRAME_INTERVAL_TOO_HIGH,
    });
  }

  return errors;
}

/**
 * Validate all-frames strategy
 *
 * All-frames strategy has no parameters to validate.
 *
 * @returns Empty array (always valid)
 */
export function validateAllFrames(): ValidationError[] {
  // No parameters to validate for all-frames strategy
  return [];
}

/**
 * Validate custom FPS strategy
 *
 * FPS must be between MIN_FPS and MAX_FPS.
 *
 * @param fps - Frames per second
 * @returns Array of validation errors (empty if valid)
 */
export function validateCustomFps(fps: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Number.isFinite(fps)) {
    errors.push({
      field: 'fps',
      message: 'FPS must be a valid number',
      code: VALIDATION_ERROR_CODES.INVALID_FPS,
    });
    return errors;
  }

  if (fps < VALIDATION_RULES.MIN_FPS) {
    errors.push({
      field: 'fps',
      message: `FPS must be at least ${VALIDATION_RULES.MIN_FPS}`,
      code: VALIDATION_ERROR_CODES.FPS_TOO_LOW,
    });
  }

  if (fps > VALIDATION_RULES.MAX_FPS) {
    errors.push({
      field: 'fps',
      message: `FPS cannot exceed ${VALIDATION_RULES.MAX_FPS}`,
      code: VALIDATION_ERROR_CODES.FPS_TOO_HIGH,
    });
  }

  return errors;
}

/**
 * Validate extraction strategy
 *
 * Main dispatcher that routes to the appropriate validator based on strategy type.
 *
 * @param strategy - Extraction strategy to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateStrategy(strategy: ExtractionStrategy): ValidationError[] {
  switch (strategy.type) {
    case 'uniform':
      return validateUniformSampling(strategy.frameCount);

    case 'interval':
      return validateIntervalBased(strategy.intervalSeconds);

    case 'frame-based':
      return validateFrameBased(strategy.frameInterval);

    case 'all-frames':
      return validateAllFrames();

    case 'custom-fps':
      return validateCustomFps(strategy.fps);

    default: {
      // TypeScript should ensure this is unreachable
      const exhaustiveCheck: never = strategy;
      return [
        {
          field: 'strategy',
          message: `Unknown strategy type: ${JSON.stringify(exhaustiveCheck)}`,
          code: VALIDATION_ERROR_CODES.UNKNOWN_STRATEGY,
        },
      ];
    }
  }
}
