package com.vitapact.app

import android.graphics.Color
import android.os.Bundle
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat

// Replaces the MainActivity that `tauri android init` generates (see .github/workflows/mobile.yml).
// Recent Android versions draw every app under the status and navigation bars, so buttons ended up
// under the clock. The content is padded by the bars, the camera cutout and the keyboard instead.
class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val content = findViewById<View>(android.R.id.content)
    // The app background (tokens.color.bg) behind the bars, with dark icons on top of it.
    content.setBackgroundColor(Color.parseColor("#F5F0E6"))
    WindowCompat.getInsetsController(window, window.decorView).apply {
      isAppearanceLightStatusBars = true
      isAppearanceLightNavigationBars = true
    }
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
      val bars = insets.getInsets(
        WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.displayCutout(),
      )
      val keyboard = insets.getInsets(WindowInsetsCompat.Type.ime())
      view.setPadding(bars.left, bars.top, bars.right, maxOf(bars.bottom, keyboard.bottom))
      WindowInsetsCompat.CONSUMED
    }
  }
}
