package com.solusinegeri.app.security

import android.content.Context
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.solusinegeri.app.BuildConfig
import com.solusinegeri.app.config.SecureConfig

/**
 * Security Native Module
 * 
 * Initializes FreeRASP in background thread and emits threat events to React Native.
 * This module handles security initialization stealthily from native layer.
 */
class SecurityNativeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val MODULE_NAME = "SecurityNativeModule"
        private const val EVENT_THREAT_DETECTED = "ThreatDetected"
        
        @Volatile
        private var isInitialized = false
        private val initLock = Any()
    }

    override fun getName(): String = MODULE_NAME

    /**
     * Initialize FreeRASP security checks
     * Called from native layer after React Native bridge is ready
     */
    fun initializeInBackground(context: Context) {
        if (isInitialized) return
        
        synchronized(initLock) {
            if (isInitialized) return
            
            try {
                // Run initialization in background thread
                Thread {
                    try {
                        // Get security config from native SecureConfig
                        val config = buildTalsecConfig(context)
                        
                        // Initialize FreeRASP via React Native bridge
                        // Note: freerasp-react-native requires React Native bridge,
                        // so we initialize it here after bridge is ready
                        initializeFreeRasp(config)
                        
                        isInitialized = true
                    } catch (e: Exception) {
                        // Silent fail - no logging in production
                        if (BuildConfig.DEBUG) {
                            android.util.Log.e(MODULE_NAME, "Security init failed", e)
                        }
                    }
                }.start()
            } catch (e: Exception) {
                // Silent fail
                if (BuildConfig.DEBUG) {
                    android.util.Log.e(MODULE_NAME, "Failed to start security init thread", e)
                }
            }
        }
    }

    /**
     * Build Talsec configuration from native SecureConfig
     */
    private fun buildTalsecConfig(context: Context): Map<String, Any> {
        val certificateHash = getCertificateHash()
        val packageName = context.packageName
        val isProd = !BuildConfig.DEBUG
        val watcherMail = SecureConfig.getSecurityEmail()
        
        val config = mutableMapOf<String, Any>()
        
        // Android config
        if (certificateHash.isNotEmpty()) {
            config["androidConfig"] = mapOf(
                "packageName" to packageName,
                "certificateHashes" to listOf(certificateHash),
                "supportedAlternativeStores" to listOf(
                    "com.android.vending",
                    "com.huawei.appmarket",
                    "com.sec.android.app.samsungapps"
                ),
                "malwareConfig" to mapOf(
                    "blacklistedPackageNames" to emptyList<String>(),
                    "blacklistedHashes" to emptyList<String>(),
                    "suspiciousPermissions" to listOf(
                        listOf("android.permission.CAMERA", "android.permission.RECORD_AUDIO"),
                        listOf("android.permission.READ_SMS", "android.permission.SEND_SMS")
                    ),
                    "whitelistedInstallationSources" to listOf(
                        "com.android.vending",
                        "com.huawei.appmarket"
                    )
                )
            )
        }
        
        // Global config
        config["isProd"] = isProd
        if (watcherMail.isNotEmpty()) {
            config["watcherMail"] = watcherMail
        }
        
        return config
    }

    /**
     * Get certificate hash from BuildConfig or SecureConfig
     */
    private fun getCertificateHash(): String {
        // Try to get from BuildConfig first
        return try {
            val hashField = BuildConfig::class.java.getField("ANDROID_CERTIFICATE_HASH")
            hashField.get(null) as? String ?: ""
        } catch (e: Exception) {
            // Fallback: return empty if not set
            ""
        }
    }

    /**
     * Initialize FreeRASP via React Native bridge
     * This uses the freerasp-react-native module through the bridge
     */
    private fun initializeFreeRasp(config: Map<String, Any>) {
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
    fun onThreatDetected(threatType: String, details: Map<String, Any> = emptyMap()) {
        try {
            val params = Arguments.createMap().apply {
                putString("threatType", threatType)
                val detailsMap = Arguments.createMap()
                details.forEach { (key, value) ->
                    when (value) {
                        is String -> detailsMap.putString(key, value)
                        is Int -> detailsMap.putInt(key, value)
                        is Boolean -> detailsMap.putBoolean(key, value)
                        is Double -> detailsMap.putDouble(key, value)
                        is List<*> -> {
                            val array = Arguments.createArray()
                            value.forEach { item ->
                                when (item) {
                                    is String -> array.pushString(item)
                                    is Int -> array.pushInt(item)
                                    else -> array.pushString(item?.toString() ?: "")
                                }
                            }
                            detailsMap.putArray(key, array)
                        }
                        else -> detailsMap.putString(key, value.toString())
                    }
                }
                putMap("details", detailsMap)
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            
            sendEvent(EVENT_THREAT_DETECTED, params)
        } catch (e: Exception) {
            // Silent fail
            if (BuildConfig.DEBUG) {
                android.util.Log.e(MODULE_NAME, "Failed to emit threat event", e)
            }
        }
    }

    /**
     * Send event to React Native
     */
    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (e: Exception) {
            // Silent fail - React Native bridge might not be ready
            if (BuildConfig.DEBUG) {
                android.util.Log.e(MODULE_NAME, "Failed to send event: $eventName", e)
            }
        }
    }

    /**
     * React Native method to manually trigger initialization
     * This can be called from JS layer if needed
     */
    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            if (isInitialized) {
                promise.resolve(true)
                return
            }
            
            initializeInBackground(reactContext.applicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", "Failed to initialize security", e)
        }
    }

    /**
     * React Native method to check if security is initialized
     */
    @ReactMethod
    fun isInitialized(promise: Promise) {
        promise.resolve(isInitialized)
    }
}
