import type {
  FrameExtractionRequest,
  FrameExtractionPlan,
  ExtractionResult,
  ValidationResult,
} from '@domain/models';
import type {
  VideoProcessingAdapter,
  FrameExtractionConfig,
  VideoMetadata,
} from '@domain/adapters';
import {
  VideoProcessingError,
  VideoProcessingErrorCode,
} from '@domain/adapters/native/VideoProcessingError';
import {
  calculateExtractionFps,
  estimateFrameCount,
  estimateTotalStorageSize,
  estimateProcessingDuration,
  generateFrameInfos,
} from '@domain/calculations';
import { validateRequest, validateStorageEstimate, VALIDATION_RULES } from '@domain/validation';

/**
 * Frame Extraction Service
 *
 * Orchestrates the complete frame extraction workflow:
 * 1. Validates requests
 * 2. Calculates extraction plans
 * 3. Executes extraction via adapter
 * 4. Transforms results to domain models
 *
 * This service provides the business logic layer above the VideoProcessingAdapter.
 */
export class FrameExtractionService {
  /**
   * Create a new frame extraction service
   *
   * @param adapter - Video processing adapter implementation
   */
  constructor(private readonly adapter: VideoProcessingAdapter) {}

  /**
   * Extract frames from a video
   *
   * Complete workflow:
   * 1. Validate request parameters
   * 2. Fetch video metadata
   * 3. Calculate extraction plan
   * 4. Validate plan (storage limits)
   * 5. Execute extraction via adapter
   * 6. Transform adapter result to domain model
   *
   * @param request - Frame extraction request
   * @returns Extraction result with frame info and metrics
   * @throws VideoProcessingError if validation fails or extraction fails
   *
   * @example
   * const service = new FrameExtractionService(adapter);
   * const result = await service.extractFrames({
   *   videoPath: '/path/to/video.mp4',
   *   outputDirectory: '/path/to/output',
   *   strategy: { type: 'uniform', frameCount: 100 },
   *   quality: 2
   * });
   * console.log(`Extracted ${result.totalFrames} frames`);
   */
  async extractFrames(request: FrameExtractionRequest): Promise<ExtractionResult> {
    // Step 1: Validate request
    const validation = this.validateRequest(request);
    if (!validation.valid) {
      throw new VideoProcessingError(
        `Invalid extraction request: ${validation.errors
          .map((e: { message: string }) => e.message)
          .join(', ')}`,
        VideoProcessingErrorCode.INVALID_PARAMS,
        validation.errors,
      );
    }

    // Step 2: Get video metadata
    const metadata = await this.adapter.getVideoMetadata(request.videoPath);

    // Step 3: Calculate extraction plan
    const plan = this.createPlan(request, metadata);

    // Step 4: Validate plan (storage limits)
    const storageErrors = validateStorageEstimate(plan.estimatedStorageMB);
    if (storageErrors.length > 0) {
      throw new VideoProcessingError(
        storageErrors[0].message,
        VideoProcessingErrorCode.INSUFFICIENT_STORAGE,
        storageErrors,
      );
    }

    // Step 5: Execute extraction via adapter
    const adapterConfig = this.planToAdapterConfig(plan);
    const adapterResult = await this.adapter.extractFrames(adapterConfig);

    // Step 6: Transform adapter result to domain result
    const result = this.transformResult(adapterResult, plan);

    return result;
  }

  /**
   * Create an extraction plan without executing
   *
   * Useful for previewing what an extraction will do:
   * - How many frames will be extracted
   * - How much storage will be used
   * - How long it might take
   *
   * @param request - Frame extraction request
   * @returns Calculated extraction plan
   * @throws VideoProcessingError if validation fails or metadata fetch fails
   *
   * @example
   * const plan = await service.planExtraction(request);
   * console.log(`Will extract ${plan.estimatedFrameCount} frames`);
   * console.log(`Estimated size: ${plan.estimatedStorageMB}MB`);
   */
  async planExtraction(request: FrameExtractionRequest): Promise<FrameExtractionPlan> {
    // Validate request
    const validation = this.validateRequest(request);
    if (!validation.valid) {
      throw new VideoProcessingError(
        `Invalid extraction request: ${validation.errors
          .map((e: { message: string }) => e.message)
          .join(', ')}`,
        VideoProcessingErrorCode.INVALID_PARAMS,
        validation.errors,
      );
    }

    // Get video metadata
    const metadata = await this.adapter.getVideoMetadata(request.videoPath);

    // Create and return plan
    return this.createPlan(request, metadata);
  }

  /**
   * Validate an extraction request
   *
   * @param request - Frame extraction request to validate
   * @returns Validation result
   *
   * @example
   * const validation = service.validateRequest(request);
   * if (!validation.valid) {
   *   console.error('Validation errors:', validation.errors);
   * }
   */
  validateRequest(request: FrameExtractionRequest): ValidationResult {
    return validateRequest(request);
  }

  /**
   * Cancel ongoing extraction
   *
   * Delegates to the adapter's cancellation mechanism.
   *
   * @example
   * await service.cancelExtraction();
   */
  async cancelExtraction(): Promise<void> {
    await this.adapter.cancelOperation();
  }

  /**
   * Create extraction plan from request and metadata
   *
   * @private
   */
  private createPlan(
    request: FrameExtractionRequest,
    metadata: VideoMetadata,
  ): FrameExtractionPlan {
    // Calculate extraction FPS based on strategy
    const extractionFps = calculateExtractionFps(request.strategy, metadata);

    // Estimate frame count
    const estimatedFrameCount = estimateFrameCount(extractionFps, metadata.duration);

    // Estimate storage
    const quality = request.quality ?? VALIDATION_RULES.DEFAULT_QUALITY;
    const estimatedStorageMB = estimateTotalStorageSize(
      estimatedFrameCount,
      metadata.width,
      metadata.height,
      quality,
    );

    // Estimate processing duration
    const estimatedDurationMs = estimateProcessingDuration(estimatedFrameCount);

    // Build plan
    const plan: FrameExtractionPlan = {
      // Request parameters
      videoPath: request.videoPath,
      outputDirectory: request.outputDirectory,
      strategy: request.strategy,
      quality,

      // Calculated values
      extractionFps,
      estimatedFrameCount,
      estimatedStorageMB,
      estimatedDurationMs,

      // Video metadata
      videoDuration: metadata.duration,
      videoFps: metadata.frameRate,
      videoResolution: {
        width: metadata.width,
        height: metadata.height,
      },
    };

    return plan;
  }

  /**
   * Convert extraction plan to adapter configuration
   *
   * @private
   */
  private planToAdapterConfig(plan: FrameExtractionPlan): FrameExtractionConfig {
    return {
      videoPath: plan.videoPath,
      outputDirectory: plan.outputDirectory,
      frameRate: plan.extractionFps,
      quality: plan.quality,
    };
  }

  /**
   * Transform adapter result to domain extraction result
   *
   * @private
   */
  private transformResult(
    adapterResult: {
      outputPaths: string[];
      frameCount: number;
      processingTimeMs: number;
    },
    plan: FrameExtractionPlan,
  ): ExtractionResult {
    // Generate frame info with timestamps
    const frames = generateFrameInfos(adapterResult.outputPaths, plan.extractionFps);

    // Calculate actual storage (placeholder for now)
    // In a real implementation, we might read file sizes here
    // For now, we use the estimate
    const actualStorageMB = plan.estimatedStorageMB;

    const result: ExtractionResult = {
      frames,
      totalFrames: adapterResult.frameCount,
      actualStorageMB,
      processingTimeMs: adapterResult.processingTimeMs,
      strategy: plan.strategy,
    };

    return result;
  }
}
