package com.videospliter.videoprocessing

import com.arthenica.ffmpegkit.FFmpegKit
import com.arthenica.ffmpegkit.FFmpegSession
import com.arthenica.ffmpegkit.FFprobeKit
import com.arthenica.ffmpegkit.ReturnCode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

/**
 * Core FFmpeg video processing logic
 * Mirrors iOS FFmpegVideoProcessor.swift implementation
 */
class FFmpegVideoProcessor {
    private var currentSession: FFmpegSession? = null

    /**
     * Result of frame extraction operation
     */
    data class ExtractionResult(
        val outputPaths: List<String>,
        val frameCount: Int,
        val processingTimeMs: Int
    )

    /**
     * Video metadata information
     */
    data class VideoMetadata(
        val duration: Double,        // Duration in seconds
        val width: Int,              // Width in pixels
        val height: Int,             // Height in pixels
        val frameRate: Double,       // FPS
        val codec: String,           // Codec name (e.g., "h264")
        val bitrate: Int             // Bitrate in bits per second
    )

    /**
     * Extract frames from video
     *
     * @param videoPath Absolute path to input video file
     * @param outputDirectory Directory where frames will be saved
     * @param frameRate Optional target FPS (e.g., 1.0 for 1 frame per second)
     * @param quality Optional quality setting (1-31, lower is better quality, default 2)
     * @return ExtractionResult with output paths and metadata
     */
    suspend fun extractFrames(
        videoPath: String,
        outputDirectory: String,
        frameRate: Double? = null,
        quality: Int = 2
    ): ExtractionResult = withContext(Dispatchers.IO) {
        val startTime = System.currentTimeMillis()

        // Validate inputs
        validateVideoPath(videoPath)
        validateAndCreateOutputDirectory(outputDirectory)

        // Build FFmpeg command
        val outputPattern = "$outputDirectory/frame_%04d.jpg"
        val command = buildExtractFramesCommand(videoPath, outputPattern, frameRate, quality)

        // Execute FFmpeg
        currentSession = FFmpegKit.execute(command)

        // Check result
        val returnCode = currentSession?.returnCode
        if (!ReturnCode.isSuccess(returnCode)) {
            val output = currentSession?.output ?: "No output"
            val failStackTrace = currentSession?.failStackTrace ?: "No stack trace"
            throw VideoProcessorError.FFMPEG_FAILED.toException(
                "Return code: $returnCode\nOutput: $output\n$failStackTrace"
            )
        }

        // Collect output frames
        val outputDir = File(outputDirectory)
        val frameFiles = outputDir.listFiles { file ->
            file.isFile && file.name.matches(Regex("frame_\\d{4}\\.jpg"))
        }?.sortedBy { it.name } ?: emptyList()

        if (frameFiles.isEmpty()) {
            throw VideoProcessorError.FFMPEG_FAILED.toException("No frames were extracted")
        }

        val outputPaths = frameFiles.map { it.absolutePath }
        val processingTime = (System.currentTimeMillis() - startTime).toInt()

        ExtractionResult(
            outputPaths = outputPaths,
            frameCount = frameFiles.size,
            processingTimeMs = processingTime
        )
    }

    /**
     * Get video metadata without extracting frames
     *
     * @param videoPath Absolute path to video file
     * @return VideoMetadata with video information
     */
    suspend fun getMetadata(videoPath: String): VideoMetadata = withContext(Dispatchers.IO) {
        validateVideoPath(videoPath)

        val mediaInformation = FFprobeKit.getMediaInformation(videoPath).mediaInformation
            ?: throw VideoProcessorError.VIDEO_NOT_FOUND.toException("Could not read video file")

        val streams = mediaInformation.streams
        val videoStream = streams.firstOrNull { stream ->
            stream.getType() == "video"
        } ?: throw VideoProcessorError.UNSUPPORTED_FORMAT.toException("No video stream found")

        // Extract properties
        val width = videoStream.width?.toInt() ?: 0
        val height = videoStream.height?.toInt() ?: 0
        val codec = videoStream.codecName ?: "unknown"

        // Parse frame rate (can be "30/1" or "30.0")
        val frameRateString = videoStream.averageFrameRate ?: "30/1"
        val frameRate = parseFractionalFPS(frameRateString)

        // Get duration and bitrate from format
        val format = mediaInformation.format
        val duration = format?.duration?.toDoubleOrNull() ?: 0.0
        val bitrate = format?.bitrate?.toIntOrNull() ?: 0

        VideoMetadata(
            duration = duration,
            width = width,
            height = height,
            frameRate = frameRate,
            codec = codec,
            bitrate = bitrate
        )
    }

    /**
     * Cancel the currently running operation
     */
    fun cancel() {
        currentSession?.cancel()
        currentSession = null
    }

    /**
     * Build FFmpeg command for frame extraction
     */
    private fun buildExtractFramesCommand(
        videoPath: String,
        outputPattern: String,
        frameRate: Double?,
        quality: Int
    ): String {
        val parts = mutableListOf<String>()

        // Input file
        parts.add("-i")
        parts.add("\"$videoPath\"")

        // Frame rate filter (optional)
        if (frameRate != null) {
            parts.add("-vf")
            parts.add("fps=$frameRate")
        }

        // Quality setting (1-31, lower is better)
        val clampedQuality = quality.coerceIn(1, 31)
        parts.add("-q:v")
        parts.add("$clampedQuality")

        // Output pattern
        parts.add("\"$outputPattern\"")

        return parts.joinToString(" ")
    }

    /**
     * Validate video path exists
     */
    private fun validateVideoPath(videoPath: String) {
        if (videoPath.isBlank()) {
            throw VideoProcessorError.INVALID_VIDEO_PATH.toException("Path is empty")
        }

        val file = File(videoPath)
        if (!file.exists()) {
            throw VideoProcessorError.VIDEO_NOT_FOUND.toException("File does not exist: $videoPath")
        }

        if (!file.isFile) {
            throw VideoProcessorError.INVALID_VIDEO_PATH.toException("Path is not a file: $videoPath")
        }

        if (!file.canRead()) {
            throw VideoProcessorError.INVALID_VIDEO_PATH.toException("Cannot read file: $videoPath")
        }
    }

    /**
     * Validate and create output directory if it doesn't exist
     */
    private fun validateAndCreateOutputDirectory(outputDirectory: String) {
        if (outputDirectory.isBlank()) {
            throw VideoProcessorError.INVALID_OUTPUT_DIR.toException("Output directory path is empty")
        }

        val dir = File(outputDirectory)

        // Create directory if it doesn't exist
        if (!dir.exists()) {
            val created = dir.mkdirs()
            if (!created) {
                throw VideoProcessorError.INVALID_OUTPUT_DIR.toException("Could not create directory: $outputDirectory")
            }
        }

        if (!dir.isDirectory) {
            throw VideoProcessorError.INVALID_OUTPUT_DIR.toException("Path is not a directory: $outputDirectory")
        }

        if (!dir.canWrite()) {
            throw VideoProcessorError.INVALID_OUTPUT_DIR.toException("Cannot write to directory: $outputDirectory")
        }
    }

    /**
     * Parse fractional FPS like "30/1" or "30.0" to Double
     * Matches iOS implementation
     */
    private fun parseFractionalFPS(fpsString: String): Double {
        return try {
            if (fpsString.contains("/")) {
                val parts = fpsString.split("/")
                val numerator = parts[0].trim().toDouble()
                val denominator = parts.getOrNull(1)?.trim()?.toDouble() ?: 1.0
                if (denominator != 0.0) numerator / denominator else numerator
            } else {
                fpsString.toDouble()
            }
        } catch (e: Exception) {
            30.0 // Default fallback
        }
    }
}
