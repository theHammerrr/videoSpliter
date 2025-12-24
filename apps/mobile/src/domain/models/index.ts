/**
 * Domain Models
 *
 * Pure TypeScript types and interfaces for frame extraction domain logic.
 */

// Extraction Strategy
export type {
  ExtractionStrategy,
  UniformSamplingStrategy,
  IntervalBasedStrategy,
  FrameBasedStrategy,
  AllFramesStrategy,
  CustomFrameRateStrategy,
} from './ExtractionStrategy';

export {
  isUniformSampling,
  isIntervalBased,
  isFrameBased,
  isAllFrames,
  isCustomFrameRate,
} from './ExtractionStrategy';

// Frame Information
export type { FrameInfo } from './FrameInfo';

// Validation
export type { ValidationError, ValidationResult } from './ValidationResult';

export {
  isValid,
  isInvalid,
  createValidResult,
  createInvalidResult,
  createInvalidResultFromArray,
} from './ValidationResult';

// Request and Response Models
export type { FrameExtractionRequest } from './FrameExtractionRequest';
export type { FrameExtractionPlan } from './FrameExtractionPlan';
export type { ExtractionResult } from './ExtractionResult';
