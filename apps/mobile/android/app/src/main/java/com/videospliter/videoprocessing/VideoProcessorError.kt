package com.videospliter.videoprocessing

/**
 * Error codes for video processing operations
 * Must match iOS VideoProcessorError and TypeScript VideoProcessingErrorCode exactly
 */
enum class VideoProcessorError(val code: String, val message: String) {
    INVALID_VIDEO_PATH("INVALID_VIDEO_PATH", "Video file path is invalid"),
    INVALID_OUTPUT_DIR("INVALID_OUTPUT_DIR", "Output directory is invalid or cannot be created"),
    FFMPEG_FAILED("FFMPEG_FAILED", "Video processing failed"),
    VIDEO_NOT_FOUND("VIDEO_NOT_FOUND", "Video file not found at the specified path"),
    UNSUPPORTED_FORMAT("UNSUPPORTED_FORMAT", "Unsupported or corrupted video format"),
    INSUFFICIENT_STORAGE("INSUFFICIENT_STORAGE", "Not enough storage space available"),
    CANCELLED("CANCELLED", "Operation was cancelled by user"),
    UNKNOWN("UNKNOWN", "An unknown error occurred");

    /**
     * Create an exception with this error
     */
    fun toException(details: String? = null): VideoProcessingException {
        val fullMessage = if (details != null) "$message: $details" else message
        return VideoProcessingException(code, fullMessage)
    }
}

/**
 * Custom exception for video processing errors
 */
class VideoProcessingException(
    val code: String,
    message: String,
    cause: Throwable? = null
) : Exception(message, cause)
