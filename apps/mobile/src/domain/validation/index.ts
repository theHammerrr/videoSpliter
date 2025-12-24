/**
 * Domain Validation
 *
 * Business rule validation for frame extraction requests.
 */

// Validation rules and constants
export { VALIDATION_RULES, VALIDATION_ERROR_CODES } from './validationRules';

// Request validation
export { validateRequest, validateStorageEstimate } from './requestValidator';

// Strategy validators
export {
  validateUniformSampling,
  validateIntervalBased,
  validateFrameBased,
  validateAllFrames,
  validateCustomFps,
  validateStrategy,
} from './validators/strategyValidators';

// Parameter validators
export {
  validateQuality,
  validateNonEmptyString,
  validateVideoPath,
  validateOutputDirectory,
} from './validators/parameterValidators';
