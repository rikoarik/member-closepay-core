import Foundation
import React

@objc(AppVersionModule)
class AppVersionModule: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func getVersion(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
      resolve(version)
    } else {
      reject("VERSION_ERROR", "Failed to get app version", nil)
    }
  }
  
  @objc
  func getBuildNumber(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String {
      resolve(buildNumber)
    } else {
      reject("BUILD_ERROR", "Failed to get build number", nil)
    }
  }
}

@objc
class AppVersionModuleBridge: NSObject {
  @objc
  static func createModule() -> AppVersionModule {
    return AppVersionModule()
  }
}

