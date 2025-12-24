//
//  FFmpegVideoProcessor.swift
//  VideoSpliter
//
//  Core FFmpeg processing logic for video operations
//

import Foundation
import ffmpegkit

/**
 * Handles video processing operations using FFmpeg
 */
class FFmpegVideoProcessor {

  /// Current FFmpeg session (for cancellation)
  private var currentSession: FFmpegSession?

  /**
   * Result from frame extraction
   */
  struct ExtractionResult {
    let outputPaths: [String]
    let frameCount: Int
    let processingTimeMs: Int
  }

  /**
   * Video metadata information
   */
  struct VideoMetadata {
    let duration: Double
    let width: Int
    let height: Int
    let frameRate: Double
    let codec: String
    let bitrate: Int
  }

  /**
   * Extract frames from a video file using FFmpeg
   */
  func extractFrames(
    videoPath: String,
    outputDirectory: String,
    frameRate: Double?,
    quality: Int?
  ) async throws -> ExtractionResult {

    // Validate inputs
    guard FileManager.default.fileExists(atPath: videoPath) else {
      throw VideoProcessorError.videoNotFound
    }

    guard FileManager.default.fileExists(atPath: outputDirectory) else {
      throw VideoProcessorError.invalidOutputDirectory
    }

    // Build FFmpeg command
    let qualityValue = quality ?? 2  // Default to high quality
    let outputPattern = "\(outputDirectory)/frame_%04d.jpg"

    var command = "-i \"\(videoPath)\" -q:v \(qualityValue)"

    // Add frame rate filter if specified
    if let fps = frameRate {
      command += " -vf fps=\(fps)"
    }

    command += " \"\(outputPattern)\""

    let startTime = Date()

    // Execute FFmpeg command
    let session = FFmpegKit.execute(command)
    currentSession = session

    guard let session = session else {
      throw VideoProcessorError.ffmpegExecutionFailed("Failed to create session")
    }

    // Check return code
    let returnCode = session.getReturnCode()

    if ReturnCode.isCancel(returnCode) {
      throw VideoProcessorError.cancelled
    }

    if !ReturnCode.isSuccess(returnCode) {
      let output = session.getOutput() ?? "Unknown error"
      throw VideoProcessorError.ffmpegExecutionFailed(output)
    }

    // Collect output files
    let outputPaths = try collectOutputFrames(directory: outputDirectory)

    let processingTime = Int(Date().timeIntervalSince(startTime) * 1000)

    return ExtractionResult(
      outputPaths: outputPaths,
      frameCount: outputPaths.count,
      processingTimeMs: processingTime
    )
  }

  /**
   * Get metadata from a video file using ffprobe
   */
  func getMetadata(videoPath: String) async throws -> VideoMetadata {
    guard FileManager.default.fileExists(atPath: videoPath) else {
      throw VideoProcessorError.videoNotFound
    }

    // Use ffprobe to get media information
    let session = FFprobeKit.getMediaInformation(videoPath)

    guard let mediaInfo = session?.getMediaInformation() else {
      throw VideoProcessorError.ffmpegExecutionFailed("Failed to get media info")
    }

    guard let durationMs = mediaInfo.getDuration() else {
      throw VideoProcessorError.unsupportedFormat
    }

    let duration = Double(durationMs) ?? 0

    // Get video stream information
    guard let streams = mediaInfo.getStreams() as? [StreamInformation],
          let videoStream = streams.first(where: { $0.getType() == "video" })
    else {
      throw VideoProcessorError.unsupportedFormat
    }

    let width = Int(videoStream.getWidth() ?? 0)
    let height = Int(videoStream.getHeight() ?? 0)
    let codec = videoStream.getCodec() ?? "unknown"
    let bitrateValue = mediaInfo.getBitrate() ?? "0"
    let bitrate = Int(bitrateValue) ?? 0

    // Parse frame rate (can be in format "30/1" or "30")
    let fpsString = videoStream.getAverageFrameRate() ?? "30"
    let frameRate = parseFps(fpsString)

    return VideoMetadata(
      duration: duration / 1000.0,  // Convert ms to seconds
      width: width,
      height: height,
      frameRate: frameRate,
      codec: codec,
      bitrate: bitrate
    )
  }

  /**
   * Cancel the current operation
   */
  func cancel() {
    currentSession?.cancel()
    currentSession = nil
  }

  // MARK: - Private Helpers

  /**
   * Collect output frame files from directory
   */
  private func collectOutputFrames(directory: String) throws -> [String] {
    let fileManager = FileManager.default
    let directoryURL = URL(fileURLWithPath: directory)

    let files = try fileManager.contentsOfDirectory(
      at: directoryURL,
      includingPropertiesForKeys: nil
    )

    return files
      .filter { $0.pathExtension == "jpg" }
      .sorted { $0.lastPathComponent < $1.lastPathComponent }
      .map { $0.path }
  }

  /**
   * Parse frame rate string (e.g., "30/1" or "30")
   */
  private func parseFps(_ fpsString: String) -> Double {
    if fpsString.contains("/") {
      let parts = fpsString.split(separator: "/")
      guard parts.count == 2,
            let numerator = Double(parts[0]),
            let denominator = Double(parts[1]),
            denominator != 0
      else {
        return 30.0  // Default fallback
      }
      return numerator / denominator
    }

    return Double(fpsString) ?? 30.0
  }
}
