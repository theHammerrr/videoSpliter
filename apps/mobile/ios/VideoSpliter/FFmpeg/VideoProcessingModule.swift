//
//  VideoProcessingModule.swift
//  VideoSpliter
//
//  React Native bridge for video processing operations
//

import Foundation
import React

@objc(VideoProcessingModule)
class VideoProcessingModule: NSObject {

  private let processor = FFmpegVideoProcessor()

  /**
   * Configure module to run on background thread
   */
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  /**
   * Extract frames from a video file
   * @param videoPath Absolute path to input video
   * @param outputDirectory Directory for output frames
   * @param frameRate Optional frame rate (fps)
   * @param quality Optional quality (1-31, lower is better)
   */
  @objc
  func extractFrames(
    _ videoPath: String,
    outputDirectory: String,
    frameRate: NSNumber?,
    quality: NSNumber?,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) -> Void {
    Task {
      do {
        let fpsValue = frameRate?.doubleValue
        let qualityValue = quality?.intValue

        let result = try await processor.extractFrames(
          videoPath: videoPath,
          outputDirectory: outputDirectory,
          frameRate: fpsValue,
          quality: qualityValue
        )

        let response: [String: Any] = [
          "outputPaths": result.outputPaths,
          "frameCount": result.frameCount,
          "processingTimeMs": result.processingTimeMs,
        ]

        resolver(response)
      } catch {
        rejectWithError(error, rejecter: rejecter)
      }
    }
  }

  /**
   * Get metadata from a video file
   * @param videoPath Absolute path to video file
   */
  @objc
  func getVideoMetadata(
    _ videoPath: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) -> Void {
    Task {
      do {
        let metadata = try await processor.getMetadata(videoPath: videoPath)

        let response: [String: Any] = [
          "duration": metadata.duration,
          "width": metadata.width,
          "height": metadata.height,
          "frameRate": metadata.frameRate,
          "codec": metadata.codec,
          "bitrate": metadata.bitrate,
        ]

        resolver(response)
      } catch {
        rejectWithError(error, rejecter: rejecter)
      }
    }
  }

  /**
   * Cancel ongoing video processing operation
   */
  @objc
  func cancelOperation(
    _ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) -> Void {
    processor.cancel()
    resolver(nil)
  }

  // MARK: - Private Helpers

  /**
   * Reject promise with properly formatted error
   */
  private func rejectWithError(
    _ error: Error,
    rejecter: RCTPromiseRejectBlock
  ) {
    if let processorError = error as? VideoProcessorError {
      rejecter(
        processorError.code,
        processorError.errorDescription,
        NSError(
          domain: "com.videospliter.videoprocessing",
          code: 0,
          userInfo: [NSLocalizedDescriptionKey: processorError.errorDescription ?? "Unknown error"]
        )
      )
    } else {
      rejecter(
        "UNKNOWN",
        error.localizedDescription,
        error as NSError
      )
    }
  }
}
