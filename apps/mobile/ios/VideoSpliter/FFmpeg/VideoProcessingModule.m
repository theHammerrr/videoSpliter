//
//  VideoProcessingModule.m
//  VideoSpliter
//
//  Objective-C bridge to expose Swift module to React Native
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoProcessingModule, NSObject)

/**
 * Extract frames from video
 */
RCT_EXTERN_METHOD(extractFrames:(NSString *)videoPath
                  outputDirectory:(NSString *)outputDirectory
                  frameRate:(NSNumber *)frameRate
                  quality:(NSNumber *)quality
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

/**
 * Get video metadata
 */
RCT_EXTERN_METHOD(getVideoMetadata:(NSString *)videoPath
                  resolver:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

/**
 * Cancel ongoing operation
 */
RCT_EXTERN_METHOD(cancelOperation:(RCTPromiseResolveBlock)resolver
                  rejecter:(RCTPromiseRejectBlock)rejecter)

/**
 * Run on background thread
 */
+ (BOOL)requiresMainQueueSetup {
  return NO;
}

@end
