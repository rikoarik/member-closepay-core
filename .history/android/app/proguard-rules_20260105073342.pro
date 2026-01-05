# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
    void set*(***);
    *** get*();
}
-keepclassmembers class * {
    @react-native-community.cli.* <methods>;
}
-dontwarn com.facebook.proguard.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# React Navigation
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }

# React Native SVG
-keep class com.horcrux.svg.** { *; }

# React Native Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# React Native Toast Message
-keep class com.prateekjain.toast.** { *; }

# React Native Clipboard
-keep class com.reactnativecommunity.clipboard.** { *; }

# React Native Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Iconsax
-keep class com.iconsax.** { *; }

# NativeWind (if used)
-keep class com.tailwindcss.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep custom views
-keep public class * extends android.view.View {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Remove ALL logging in release for smaller APK and security
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
    public static *** w(...);
    public static *** e(...);
}

# Normal optimization (safe for React Native TurboModules)
-optimizationpasses 3
-dontpreverify

# ==========================================
# TURBOMODULE SUPPORT (Critical for New Arch)
# ==========================================

# Keep TurboModule interfaces and implementations
-keep class * extends com.facebook.react.turbomodule.core.interfaces.TurboModule { *; }
-keep interface com.facebook.react.turbomodule.core.interfaces.** { *; }

# Keep all class NAMES in facebook.react (critical for registry lookup)
-keepnames class com.facebook.react.** { *; }
-keepnames class com.facebook.hermes.** { *; }
-keepnames class com.facebook.jni.** { *; }

# Keep defaults and system modules (contains PlatformConstants)
-keep class com.facebook.react.defaults.** { *; }
-keep class com.facebook.react.modules.systeminfo.** { *; }
-keep class com.facebook.react.modules.core.** { *; }

# React Native Config
-keep class com.lugg.ReactNativeConfig.** { *; }
-keepclassmembers class com.lugg.ReactNativeConfig.** { *; }

# React Native Encrypted Storage
-keep class com.emeraldsanto.encryptedstorage.** { *; }
-keepclassmembers class com.emeraldsanto.encryptedstorage.** { *; }

# Talsec freeRASP
-keep class com.aheaditec.talsec.** { *; }
-keepclassmembers class com.aheaditec.talsec.** { *; }
-keep class com.talsec.** { *; }
-keepclassmembers class com.talsec.** { *; }

# Security Native Module - Keep for React Native bridge
-keep class com.solusinegeri.app.security.SecurityNativeModule { *; }
-keepclassmembers class com.solusinegeri.app.security.SecurityNativeModule { *; }
-keep class com.solusinegeri.app.security.SecurityNativePackage { *; }

# React Native Worklets
-keep class com.swmansion.worklets.** { *; }

# Zustand (if using reflection)
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses

# Keep all React Native modules
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Prevent stripping of native module methods
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Keep our custom app modules
-keep class com.solusinegeri.app.** { *; }
-keepnames class com.solusinegeri.app.** { *; }
