package com.merchantclosepayv2

import android.content.Context
import com.chuckerteam.chucker.api.ChuckerInterceptor
import com.facebook.react.modules.network.OkHttpClientFactory
import com.facebook.react.modules.network.OkHttpClientProvider
import okhttp3.OkHttpClient

import com.chuckerteam.chucker.api.ChuckerCollector
import com.chuckerteam.chucker.api.RetentionManager

class CustomNetworkModule(private val context: Context) : OkHttpClientFactory {
    override fun createNewNetworkModuleClient(): OkHttpClient {
        val collector = ChuckerCollector(
            context = context,
            showNotification = true,
            retentionPeriod = RetentionManager.Period.ONE_HOUR
        )

        val chuckerInterceptor = ChuckerInterceptor.Builder(context)
            .collector(collector)
            .maxContentLength(250_000L)
            .redactHeaders(emptySet())
            .alwaysReadResponseBody(false)
            .build()

        return OkHttpClientProvider.createClientBuilder()
            .addInterceptor { chain ->
                val request = chain.request()
                // Simple filtering: Only log requests to our API
                // You can add more complex logic here
                if (request.url.toString().contains("api")) {
                    chuckerInterceptor.intercept(chain)
                } else {
                    chain.proceed(request)
                }
            }
            .build()
    }
}
