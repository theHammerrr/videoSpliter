//
//  VideoProcessorError.swift
//  VideoSpliter
//
//  Video processing error types
//

import Foundation

/**
 * Errors that can occur during video processing operations
 */
enum VideoProcessorError: Error, LocalizedError {
  case invalidVideoPath
  case invalidOutputDirectory
  case ffmpegExecutionFailed(String)
  case videoNotFound
  case unsupportedFormat
  case insufficientStorage
  case cancelled
  case unknown(Error)

  /**
   * Human-readable error description
   */
  var errorDescription: String? {
    switch self {
    case .invalidVideoPath:
      return "Invalid video path provided"
    case .invalidOutputDirectory:
      return "Invalid output directory"
    case .ffmpegExecutionFailed(let message):
      return "FFmpeg execution failed: \(message)"
    case .videoNotFound:
      return "Video file not found"
    case .unsupportedFormat:
      return "Unsupported video format"
    case .insufficientStorage:
      return "Insufficient storage space"
    case .cancelled:
      return "Operation was cancelled"
    case .unknown(let error):
      return "Unknown error: \(error.localizedDescription)"
    }
  }

  /**
   * Error code for JavaScript bridge
   */
  var code: String {
    switch self {
    case .invalidVideoPath: return "INVALID_VIDEO_PATH"
    case .invalidOutputDirectory: return "INVALID_OUTPUT_DIR"
    case .ffmpegExecutionFailed: return "FFMPEG_FAILED"
    case .videoNotFound: return "VIDEO_NOT_FOUND"
    case .unsupportedFormat: return "UNSUPPORTED_FORMAT"
    case .insufficientStorage: return "INSUFFICIENT_STORAGE"
    case .cancelled: return "CANCELLED"
    case .unknown: return "UNKNOWN"
    }
  }
}
