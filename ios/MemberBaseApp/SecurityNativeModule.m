#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(SecurityNativeModule, RCTEventEmitter)

RCT_EXTERN_METHOD(initialize:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isInitialized:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(onThreatDetected:(NSString *)threatType
                  details:(NSDictionary *)details)

RCT_EXTERN_METHOD(initializeInBackground)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
