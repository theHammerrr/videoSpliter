package com.videospliter.videoprocessing

import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * React Native bridge for video processing operations
 * Exposes native video processing functionality to JavaScript
 * Must match iOS VideoProcessingModule interface exactly
 */
@ReactModule(name = VideoProcessingModule.NAME)
class VideoProcessingModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "VideoProcessingModule"
    }

    private val processor = AndroidVideoProcessor()
    private val moduleScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    override fun getName(): String = NAME

    /**
     * Extract frames from a video file
     *
     * @param videoPath Absolute path to the input video file
     * @param outputDirectory Directory where extracted frames will be saved
     * @param frameRate Optional target frame rate (e.g., 1.0 for 1 FPS)
     * @param quality Optional quality setting (1-31, lower is better quality)
     * @param promise Promise that resolves with extraction result
     */
    @ReactMethod
    fun extractFrames(
        videoPath: String,
        outputDirectory: String,
        frameRate: Double?,
        quality: Double?,
        promise: Promise
    ) {
        moduleScope.launch {
            try {
                // Convert quality from Double to Int (React Native doesn't support optional Int)
                val qualityInt = quality?.toInt() ?: 2

                val result = processor.extractFrames(
                    videoPath = videoPath,
                    outputDirectory = outputDirectory,
                    frameRate = frameRate,
                    quality = qualityInt
                )

                // Convert result to WritableMap
                val resultMap = Arguments.createMap().apply {
                    // Output paths array
                    val pathsArray = Arguments.createArray()
                    result.outputPaths.forEach { path ->
                        pathsArray.pushString(path)
                    }
                    putArray("outputPaths", pathsArray)

                    // Frame count
                    putInt("frameCount", result.frameCount)

                    // Processing time
                    putInt("processingTimeMs", result.processingTimeMs)
                }

                promise.resolve(resultMap)
            } catch (e: VideoProcessingException) {
                promise.reject(e.code, e.message, e)
            } catch (e: Exception) {
                promise.reject(
                    VideoProcessorError.UNKNOWN.code,
                    e.message ?: "Unknown error occurred",
                    e
                )
            }
        }
    }

    /**
     * Get metadata for a video file without extracting frames
     *
     * @param videoPath Absolute path to the video file
     * @param promise Promise that resolves with video metadata
     */
    @ReactMethod
    fun getVideoMetadata(videoPath: String, promise: Promise) {
        moduleScope.launch {
            try {
                val metadata = processor.getMetadata(videoPath)

                // Convert metadata to WritableMap
                val metadataMap = Arguments.createMap().apply {
                    putDouble("duration", metadata.duration)
                    putInt("width", metadata.width)
                    putInt("height", metadata.height)
                    putDouble("frameRate", metadata.frameRate)
                    putString("codec", metadata.codec)
                    putInt("bitrate", metadata.bitrate)
                }

                promise.resolve(metadataMap)
            } catch (e: VideoProcessingException) {
                promise.reject(e.code, e.message, e)
            } catch (e: Exception) {
                promise.reject(
                    VideoProcessorError.UNKNOWN.code,
                    e.message ?: "Unknown error occurred",
                    e
                )
            }
        }
    }

    /**
     * Cancel the currently running operation
     *
     * @param promise Promise that resolves when cancellation is complete
     */
    @ReactMethod
    fun cancelOperation(promise: Promise) {
        try {
            processor.cancel()
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject(
                VideoProcessorError.UNKNOWN.code,
                "Failed to cancel operation: ${e.message}",
                e
            )
        }
    }

    /**
     * Clean up resources when module is destroyed
     */
    override fun invalidate() {
        super.invalidate()
        processor.cancel()
    }
}
