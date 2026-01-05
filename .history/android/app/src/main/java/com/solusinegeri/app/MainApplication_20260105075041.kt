package com.solusinegeri.app

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

import com.facebook.react.modules.network.OkHttpClientProvider

// Import packages from organized folders
import com.solusinegeri.app.config.AppVersionPackage
import com.solusinegeri.app.config.ConfigPackage
import com.solusinegeri.app.imagepicker.ImagePickerPackage
import com.solusinegeri.app.security.NativeCryptoPackage
import com.solusinegeri.app.security.SecurityNativePackage
import com.solusinegeri.app.storage.SecureStoragePackage
import com.solusinegeri.app.utils.ClipboardPackage
import com.solusinegeri.app.network.CustomNetworkModule

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          add(AppVersionPackage())
          add(ImagePickerPackage())
          add(NativeCryptoPackage())
          add(SecureStoragePackage())
          add(ClipboardPackage())
          add(ConfigPackage())
          add(SecurityNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    
    // Security initialization is handled by SecurityNativeModule
    // which initializes FreeRASP in background thread after React Native bridge is ready
    
    OkHttpClientProvider.setOkHttpClientFactory(CustomNetworkModule(this))
    loadReactNative(this)
  }
}
