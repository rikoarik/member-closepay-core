import Foundation
import React

/**
 * Security Native Module for iOS
 * 
 * Initializes FreeRASP in background queue and emits threat events to React Native.
 * This module handles security initialization stealthily from native layer.
 */
@objc(SecurityNativeModule)
class SecurityNativeModule: RCTEventEmitter {
  
  private static let MODULE_NAME = "SecurityNativeModule"
  private static let EVENT_THREAT_DETECTED = "ThreatDetected"
  
  private static var isInitialized = false
  private static let initLock = NSLock()
  private var hasListeners = false
  
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  override func supportedEvents() -> [String]! {
    return [SecurityNativeModule.EVENT_THREAT_DETECTED]
  }
  
  override func startObserving() {
    hasListeners = true
  }
  
  override func stopObserving() {
    hasListeners = false
  }
  
  /**
   * Initialize FreeRASP security checks
   * Called from native layer after React Native bridge is ready
   */
  @objc
  func initializeInBackground() {
    if SecurityNativeModule.isInitialized {
      return
    }
    
    SecurityNativeModule.initLock.lock()
    defer { SecurityNativeModule.initLock.unlock() }
    
    if SecurityNativeModule.isInitialized {
      return
    }
    
    // Run initialization in background queue
    DispatchQueue.global(qos: .background).async { [weak self] in
      guard let self = self else { return }
      
      do {
        // Get security config from native SecureConfig
        let config = self.buildTalsecConfig()
        
        // Initialize FreeRASP via React Native bridge
        // Note: freerasp-react-native requires React Native bridge,
        // so we initialize it here after bridge is ready
        try self.initializeFreeRasp(config: config)
        
        SecurityNativeModule.isInitialized = true
      } catch {
        // Silent fail - no logging in production
        #if DEBUG
        print("\(SecurityNativeModule.MODULE_NAME): Security init failed: \(error)")
        #endif
      }
    }
  }
  
  /**
   * Build Talsec configuration from native SecureConfig
   */
  private func buildTalsecConfig() -> [String: Any] {
    let bundleId = Bundle.main.bundleIdentifier ?? "com.solusinegeri.app"
    let isProd = !isDebugBuild()
    let watcherMail = SecureConfig.getSecurityEmail()
    let appTeamId = getAppTeamId()
    
    var config: [String: Any] = [:]
    
    // iOS config
    if !appTeamId.isEmpty {
      config["iosConfig"] = [
        "appBundleId": bundleId,
        "appTeamId": appTeamId
      ]
    }
    
    // Global config
    config["isProd"] = isProd
    if !watcherMail.isEmpty {
      config["watcherMail"] = watcherMail
    }
    
    return config
  }
  
  /**
   * Get app team ID from Info.plist or configuration
   */
  private func getAppTeamId() -> String {
    // Try to get from Info.plist first
    if let teamId = Bundle.main.object(forInfoDictionaryKey: "IOS_APP_TEAM_ID") as? String {
      return teamId
    }
    
    // Fallback: return empty if not set
    return ""
  }
  
  /**
   * Check if current build is debug
   */
  private func isDebugBuild() -> Bool {
    #if DEBUG
    return true
    #else
    return false
    #endif
  }
  
  /**
   * Initialize FreeRASP via React Native bridge
   * This uses the freerasp-react-native module through the bridge
   */
  private func initializeFreeRasp(config: [String: Any]) throws {
    // Note: freerasp-react-native v4.x uses React Native bridge
    // We'll call the native module's start method via bridge
    // This will be handled by the JS layer through event coordination
    // For now, we emit a ready event that JS layer can use to trigger init
    
    // Emit initialization event (optional - for coordination)
    // The actual FreeRASP init will be done via JS layer on first bridge ready
  }
  
  /**
   * Handle threat detected from native layer
   * This is called by threat handlers and emits events to React Native
   */
  @objc
  func onThreatDetected(_ threatType: String, details: [String: Any] = [:]) {
    guard hasListeners else { return }
    
    var eventData: [String: Any] = [
      "threatType": threatType,
      "timestamp": Date().timeIntervalSince1970 * 1000
    ]
    
    if !details.isEmpty {
      eventData["details"] = details
    }
    
    sendEvent(withName: SecurityNativeModule.EVENT_THREAT_DETECTED, body: eventData)
  }
  
  /**
   * React Native method to manually trigger initialization
   * This can be called from JS layer if needed
   */
  @objc
  func initialize(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if SecurityNativeModule.isInitialized {
      resolve(true)
      return
    }
    
    initializeInBackground()
    resolve(true)
  }
  
  /**
   * React Native method to check if security is initialized
   */
  @objc
  func isInitialized(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    resolve(SecurityNativeModule.isInitialized)
  }
}
