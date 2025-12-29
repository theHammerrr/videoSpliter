package com.videospliter.videoprocessing

import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import kotlin.math.roundToInt

/**
 * Android-native video processing using platform APIs.
 */
class AndroidVideoProcessor {
    @Volatile
    private var cancelled = false

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
        val frameRate: Double,       // FPS (best-effort)
        val codec: String,           // Codec/mime type when available
        val bitrate: Int             // Bitrate in bits per second
    )

    /**
     * Extract frames from video using MediaMetadataRetriever.
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
        cancelled = false

        validateVideoPath(videoPath)
        validateAndCreateOutputDirectory(outputDirectory)

        val retriever = MediaMetadataRetriever()
        try {
            retriever.setDataSource(videoPath)

            val durationMs =
                retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull()
                    ?: 0L
            val intervalMs = if (frameRate != null && frameRate > 0.0) {
                (1000.0 / frameRate)
            } else {
                1000.0
            }

            val outputPaths = mutableListOf<String>()
            var frameIndex = 1
            var timeMs = 0.0
            val jpegQuality = mapQualityToJpeg(quality)

            while (timeMs <= durationMs && !cancelled) {
                val timeUs = (timeMs * 1000.0).toLong()
                val bitmap = retriever.getFrameAtTime(
                    timeUs,
                    MediaMetadataRetriever.OPTION_CLOSEST
                )

                if (bitmap != null) {
                    val outputFile = File(outputDirectory, String.format("frame_%04d.jpg", frameIndex))
                    FileOutputStream(outputFile).use { outputStream ->
                        bitmap.compress(Bitmap.CompressFormat.JPEG, jpegQuality, outputStream)
                    }
                    bitmap.recycle()

                    outputPaths.add(outputFile.absolutePath)
                    frameIndex += 1
                }

                timeMs += intervalMs
            }

            if (cancelled) {
                throw VideoProcessorError.CANCELLED.toException("Frame extraction cancelled")
            }

            if (outputPaths.isEmpty()) {
                throw VideoProcessorError.UNSUPPORTED_FORMAT.toException("No frames could be extracted")
            }

            val processingTime = (System.currentTimeMillis() - startTime).toInt()

            ExtractionResult(
                outputPaths = outputPaths,
                frameCount = outputPaths.size,
                processingTimeMs = processingTime
            )
        } finally {
            retriever.release()
        }
    }

    /**
     * Get video metadata without extracting frames
     *
     * @param videoPath Absolute path to video file
     * @return VideoMetadata with video information
     */
    suspend fun getMetadata(videoPath: String): VideoMetadata = withContext(Dispatchers.IO) {
        validateVideoPath(videoPath)

        val retriever = MediaMetadataRetriever()
        try {
            retriever.setDataSource(videoPath)

            val durationMs =
                retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toDoubleOrNull()
                    ?: 0.0
            val width =
                retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull()
                    ?: 0
            val height =
                retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull()
                    ?: 0
            val bitrate = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_BITRATE)?.toIntOrNull() ?: 0
            } else {
                0
            }
            val frameRate = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_CAPTURE_FRAMERATE)
                    ?.toDoubleOrNull() ?: 0.0
            } else {
                0.0
            }
            val codec = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_MIMETYPE) ?: "unknown"
            } else {
                "unknown"
            }

            VideoMetadata(
                duration = durationMs / 1000.0,
                width = width,
                height = height,
                frameRate = frameRate,
                codec = codec,
                bitrate = bitrate
            )
        } finally {
            retriever.release()
        }
    }

    /**
     * Cancel the currently running operation
     */
    fun cancel() {
        cancelled = true
    }

    /**
     * Map 1-31 quality (lower is better) to JPEG 0-100 (higher is better).
     */
    private fun mapQualityToJpeg(quality: Int): Int {
        val clamped = quality.coerceIn(1, 31)
        val normalized = (clamped - 1) / 30.0
        val jpegQuality = (100.0 - (normalized * 90.0)).roundToInt()
        return jpegQuality.coerceIn(1, 100)
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

        if (!dir.exists()) {
            val created = dir.mkdirs()
            if (!created) {
                throw VideoProcessorError.INVALID_OUTPUT_DIR.toException(
                    "Could not create directory: $outputDirectory"
                )
            }
        }

        if (!dir.isDirectory) {
            throw VideoProcessorError.INVALID_OUTPUT_DIR.toException("Path is not a directory: $outputDirectory")
        }

        if (!dir.canWrite()) {
            throw VideoProcessorError.INVALID_OUTPUT_DIR.toException("Cannot write to directory: $outputDirectory")
        }
    }
}
