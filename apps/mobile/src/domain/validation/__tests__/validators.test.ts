import {
  validateUniformSampling,
  validateIntervalBased,
  validateFrameBased,
  validateAllFrames,
  validateCustomFps,
  validateStrategy,
} from '../validators/strategyValidators';
import {
  validateQuality,
  validateNonEmptyString,
  validateVideoPath,
  validateOutputDirectory,
} from '../validators/parameterValidators';
import { VALIDATION_ERROR_CODES } from '../validationRules';

describe('validators', () => {
  describe('strategyValidators', () => {
    describe('validateUniformSampling', () => {
      it('should pass for valid frame counts', () => {
        expect(validateUniformSampling(1)).toEqual([]);
        expect(validateUniformSampling(100)).toEqual([]);
        expect(validateUniformSampling(10000)).toEqual([]);
      });

      it('should fail for frame count below minimum', () => {
        const errors = validateUniformSampling(0);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.FRAME_COUNT_TOO_LOW);
      });

      it('should fail for frame count above maximum', () => {
        const errors = validateUniformSampling(10001);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.FRAME_COUNT_TOO_HIGH);
      });

      it('should fail for non-integer values', () => {
        const errors = validateUniformSampling(100.5);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.INVALID_FRAME_COUNT);
      });

      it('should fail for non-finite values', () => {
        const errors = validateUniformSampling(NaN);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.INVALID_FRAME_COUNT);
      });
    });

    describe('validateIntervalBased', () => {
      it('should pass for valid intervals', () => {
        expect(validateIntervalBased(0.001)).toEqual([]);
        expect(validateIntervalBased(1)).toEqual([]);
        expect(validateIntervalBased(3600)).toEqual([]);
      });

      it('should fail for interval below minimum', () => {
        const errors = validateIntervalBased(0.0001);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.INTERVAL_TOO_LOW);
      });

      it('should fail for interval above maximum', () => {
        const errors = validateIntervalBased(3601);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.INTERVAL_TOO_HIGH);
      });

      it('should fail for non-finite values', () => {
        const errors = validateIntervalBased(NaN);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.INVALID_INTERVAL);
      });
    });

    describe('validateFrameBased', () => {
      it('should pass for valid frame intervals', () => {
        expect(validateFrameBased(1)).toEqual([]);
        expect(validateFrameBased(30)).toEqual([]);
        expect(validateFrameBased(1000)).toEqual([]);
      });

      it('should fail for frame interval below minimum', () => {
        const errors = validateFrameBased(0);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.FRAME_INTERVAL_TOO_LOW);
      });

      it('should fail for frame interval above maximum', () => {
        const errors = validateFrameBased(1001);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.FRAME_INTERVAL_TOO_HIGH);
      });

      it('should fail for non-integer values', () => {
        const errors = validateFrameBased(30.5);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.INVALID_FRAME_INTERVAL);
      });
    });

    describe('validateAllFrames', () => {
      it('should always pass (no parameters to validate)', () => {
        expect(validateAllFrames()).toEqual([]);
      });
    });

    describe('validateCustomFps', () => {
      it('should pass for valid FPS values', () => {
        expect(validateCustomFps(0.001)).toEqual([]);
        expect(validateCustomFps(30)).toEqual([]);
        expect(validateCustomFps(120)).toEqual([]);
      });

      it('should fail for FPS below minimum', () => {
        const errors = validateCustomFps(0.0001);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.FPS_TOO_LOW);
      });

      it('should fail for FPS above maximum', () => {
        const errors = validateCustomFps(121);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.FPS_TOO_HIGH);
      });

      it('should fail for non-finite values', () => {
        const errors = validateCustomFps(NaN);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.INVALID_FPS);
      });
    });

    describe('validateStrategy', () => {
      it('should validate uniform sampling strategy', () => {
        expect(validateStrategy({ type: 'uniform', frameCount: 100 })).toEqual([]);
        expect(validateStrategy({ type: 'uniform', frameCount: 0 })).toHaveLength(1);
      });

      it('should validate interval-based strategy', () => {
        expect(validateStrategy({ type: 'interval', intervalSeconds: 2 })).toEqual([]);
        expect(validateStrategy({ type: 'interval', intervalSeconds: 0.0001 })).toHaveLength(1);
      });

      it('should validate frame-based strategy', () => {
        expect(validateStrategy({ type: 'frame-based', frameInterval: 30 })).toEqual([]);
        expect(validateStrategy({ type: 'frame-based', frameInterval: 0 })).toHaveLength(1);
      });

      it('should validate all-frames strategy', () => {
        expect(validateStrategy({ type: 'all-frames' })).toEqual([]);
      });

      it('should validate custom-fps strategy', () => {
        expect(validateStrategy({ type: 'custom-fps', fps: 10 })).toEqual([]);
        expect(validateStrategy({ type: 'custom-fps', fps: 0 })).toHaveLength(1);
      });
    });
  });

  describe('parameterValidators', () => {
    describe('validateQuality', () => {
      it('should pass for valid quality values', () => {
        expect(validateQuality(1)).toEqual([]);
        expect(validateQuality(2)).toEqual([]);
        expect(validateQuality(15)).toEqual([]);
        expect(validateQuality(31)).toEqual([]);
      });

      it('should fail for quality below minimum', () => {
        const errors = validateQuality(0);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.QUALITY_OUT_OF_RANGE);
      });

      it('should fail for quality above maximum', () => {
        const errors = validateQuality(32);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.QUALITY_OUT_OF_RANGE);
      });

      it('should fail for non-finite values', () => {
        const errors = validateQuality(NaN);
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.INVALID_QUALITY);
      });
    });

    describe('validateNonEmptyString', () => {
      it('should pass for non-empty strings', () => {
        expect(validateNonEmptyString('hello', 'field')).toEqual([]);
        expect(validateNonEmptyString('/path/to/file', 'field')).toEqual([]);
      });

      it('should fail for empty strings', () => {
        const errors = validateNonEmptyString('', 'field');
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.EMPTY_PATH);
        expect(errors[0].field).toBe('field');
      });

      it('should fail for whitespace-only strings', () => {
        const errors = validateNonEmptyString('   ', 'field');
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.EMPTY_PATH);
      });

      it('should fail for non-string values', () => {
        const errors = validateNonEmptyString(123 as unknown as string, 'field');
        expect(errors).toHaveLength(1);
        expect(errors[0].code).toBe(VALIDATION_ERROR_CODES.INVALID_VALUE);
      });
    });

    describe('validateVideoPath', () => {
      it('should pass for non-empty video paths', () => {
        expect(validateVideoPath('/path/to/video.mp4')).toEqual([]);
      });

      it('should fail for empty video paths', () => {
        const errors = validateVideoPath('');
        expect(errors).toHaveLength(1);
        expect(errors[0].field).toBe('videoPath');
      });
    });

    describe('validateOutputDirectory', () => {
      it('should pass for non-empty output directories', () => {
        expect(validateOutputDirectory('/path/to/output')).toEqual([]);
      });

      it('should fail for empty output directories', () => {
        const errors = validateOutputDirectory('');
        expect(errors).toHaveLength(1);
        expect(errors[0].field).toBe('outputDirectory');
      });
    });
  });
});
