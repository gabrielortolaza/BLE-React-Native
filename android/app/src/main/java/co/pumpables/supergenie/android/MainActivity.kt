package co.pumpables.supergenie.android

import org.devio.rn.splashscreen.SplashScreen
import android.os.Bundle

import io.branch.rnbranch.*
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.content.Intent

class MainActivity : ReactActivity() {
    //react-native-screens override
    override fun onCreate(savedInstanceState: Bundle?) {
      super.onCreate(null)
      SplashScreen.show(this)
    }

    override fun onStart() {
      super.onStart()
      RNBranchModule.initSession(getIntent().getData(), this)
    }

    override fun onNewIntent(intent: Intent?) {
      super.onNewIntent(intent)
      setIntent(intent)
      RNBranchModule.reInitSession(this)
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    override fun getMainComponentName(): String = "Pumpables"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
    */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
