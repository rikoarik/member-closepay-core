package com.merchantclosepayv2

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.content.pm.PackageManager

class AppVersionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppVersionModule"
    }

    @ReactMethod
    fun getVersion(promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val packageName = reactApplicationContext.packageName
            val packageInfo = packageManager.getPackageInfo(packageName, 0)
            val versionName = packageInfo.versionName ?: "1.0.0"
            promise.resolve(versionName)
        } catch (e: Exception) {
            promise.reject("VERSION_ERROR", "Failed to get app version", e)
        }
    }

    @ReactMethod
    fun getBuildNumber(promise: Promise) {
        try {
            val packageManager = reactApplicationContext.packageManager
            val packageName = reactApplicationContext.packageName
            val packageInfo = packageManager.getPackageInfo(packageName, 0)
            val versionCode = packageInfo.longVersionCode
            promise.resolve(versionCode.toString())
        } catch (e: Exception) {
            promise.reject("BUILD_ERROR", "Failed to get build number", e)
        }
    }
}

