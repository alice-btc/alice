package com.alicebitcoin.app

import android.graphics.Color
import android.os.Bundle
import android.webkit.WebView
import androidx.activity.SystemBarStyle
import androidx.activity.enableEdgeToEdge
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Alice opens on its dark theme whatever the system theme, so the status
    // bar starts with light icons until the page says otherwise.
    setSystemBars(dark = true)
    super.onCreate(savedInstanceState)
  }

  // The page posts its theme, "dark" or "light", to aliceSystemBars whenever
  // it applies one (apps/app-web/src/lib/theme-init.ts). Only Alice's own
  // origin gets the object, not the frames it embeds.
  override fun onWebViewCreate(webView: WebView) {
    if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) return
    WebViewCompat.addWebMessageListener(
      webView,
      "aliceSystemBars",
      setOf("http://tauri.localhost"),
    ) { _, message, _, _, _ ->
      setSystemBars(dark = message.data != "light")
    }
  }

  private fun setSystemBars(dark: Boolean) {
    val style = if (dark) {
      SystemBarStyle.dark(Color.TRANSPARENT)
    } else {
      SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT)
    }
    enableEdgeToEdge(statusBarStyle = style, navigationBarStyle = style)
  }
}
