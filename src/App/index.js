/* eslint-disable react/prop-types */
import "react-native-gesture-handler";
import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import {
  View, AppState, StatusBar, Platform,
  LogBox
} from "react-native";
import { Provider } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Bugsnag from "@bugsnag/react-native";
import firebase from "@react-native-firebase/app";
import "@react-native-firebase/auth";
import "@react-native-firebase/crashlytics";
import "@react-native-firebase/database";
import messaging from "@react-native-firebase/messaging";
import "@react-native-firebase/storage";
import "@react-native-firebase/analytics";
import Toast from "react-native-toast-message";
import { ifIphoneX } from "react-native-iphone-screen-helper";
// import BackgroundFetch from 'react-native-background-fetch'

import { navigationRef } from "./RootNavigation";
import store from "../New_Store";
import StyleSheet from "../Proportional";
import {
  ToastMessage, Draggable, StopSessionLogs,
  ButtonRound, Label,
} from "../Components/Shared";
import UniversalReviewModal from "../Components/Shared/UniversalReviewModal";
import LowBatteryModal from "../Components/Shared/LowBatteryModal";
import PumpAdder from "../Components/SuperGenieScreen/Home/PumpAdder";
import BaseNavigator from "./BaseNavigator";
import {
  pumpInit, authInit, addMessage,
  updateFCMToken, changeAppState, statusInit,
  changeADProgramPumpName, updateDSTSchedule, hideToast,
  reset as resetLog
} from "../Actions";
import { Colors, Fonts } from "../Themes";
import { CHANGED_AD_PROGRAMS_PUMP_NAME, CHECKED_DST_TODAY } from "../Config/LocalStorage";
import { checkUserDSTSettings } from "../Services/SharedFunctions";
import { IN_DST } from "../Config/constants";

const toastConfig = {
  ctaToast: ({ text1, props }) => {
    const {
      showCTAButtons, confirmText, dismissText, onPressConfirm, onPressDismiss
    } = props;

    return (
      <View style={styles.toastContainer}>
        <Label style={styles.toastMainText}>{text1}</Label>
        {showCTAButtons && (
          <View style={styles.flexRow}>
            <ButtonRound style={[styles.toastCTAButton, styles.btnMain]} onPress={onPressConfirm}>
              <Label maxFontSizeMultiplier={1} style={styles.btnText}>{confirmText}</Label>
            </ButtonRound>
            {onPressDismiss && (
              <ButtonRound style={styles.toastCTAButton} onPress={onPressDismiss}>
                <Label maxFontSizeMultiplier={1} style={styles.btnText}>{dismissText}</Label>
              </ButtonRound>
            )}
          </View>
        )}
      </View>
    );
  },
};

class App extends Component {
  componentDidMount() {
    // LogBox.ignoreLogs(["Animated: `useNativeDriver`"]);
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

    Bugsnag.start();
    store.dispatch(authInit());
    store.dispatch(pumpInit());
    store.dispatch(statusInit());
    store.dispatch(resetLog());

    AsyncStorage.getItem(CHANGED_AD_PROGRAMS_PUMP_NAME).then((val) => {
      if (!val) {
        setTimeout(() => {
          store.dispatch(changeADProgramPumpName());
        }, 5500);
      }
    });

    // Set status bar text to dark colours
    if (Platform.OS === "ios") {
      StatusBar.setBarStyle("dark-content");
    }

    messaging().onTokenRefresh((pushToken) => {
      // When Token gets refreshed
      store.dispatch(updateFCMToken(pushToken));
    });

    this.notificationListener = messaging().onMessage(async (remoteMessage) => {
      console.log("A new FCM message arrived!", remoteMessage);
      store.dispatch(addMessage(remoteMessage.notification.body));
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log("Message handled in the background!", remoteMessage);
    });

    this.appStateSubscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange
    );

    // Runs if the user kills/restarts App
    setTimeout(() => {
      this.checkForDST();
    }, 5000);

    // try {
    //   BackgroundFetch.configure({
    //     minimumFetchInterval: 60, // <-- minutes (15 is minimum allowed)
    //     stopOnTerminate: false, // <-- Android-only,
    //     startOnBoot: true // <-- Android-only
    //   }, () => {
    //     if (store.user && store.user.profile) {
    //       store.notifications.updateLocalAlerts(store.user.profile)
    //     }
    //     BackgroundFetch.finish()
    //   }, (error) => {
    //     console.log('[js] RNBackgroundFetch failed to start: ', error.message)
    //   })
    // } catch (e) {
    //   console.log(e)
    // }
  }

  componentWillUnmount() {
    this.notificationListener();
    this.appStateSubscription && this.appStateSubscription.remove();
  }

  handleAppStateChange = (nextAppState) => {
    if (nextAppState === "active") {
      // Runs if the user doesn't kill/restart App
      setTimeout(() => {
        this.checkForDST();
      }, 5000);
    }

    store.dispatch(changeAppState(nextAppState));
  };

  checkForDST = () => {
    if (!firebase.auth().currentUser) {
      return;
    }

    // First check if you've performed the check today
    // Check is by device, not Firebase

    const date = new Date();
    const todayDate = `${date.getUTCDate()}-${date.getUTCMonth()}-${date.getUTCFullYear()}`;

    AsyncStorage.getItem(CHECKED_DST_TODAY)
      .then((checkedDSTVal) => {
        if (!(checkedDSTVal && checkedDSTVal === todayDate)) {
          AsyncStorage.setItem(CHECKED_DST_TODAY, todayDate);

          // Check for user stored DST settings
          checkUserDSTSettings()
            .then((typeDST) => {
              if (typeDST) {
                // Then ask the user if they want to update schedule
                const toastParams = {
                  showCTAButtons: true,
                  confirmText: "Ok",
                  dismissText: "No",
                  onPressConfirm: () => {
                    hideToast();
                    store.dispatch(updateDSTSchedule(typeDST));
                  },
                  onPressDismiss: () => (hideToast())
                };

                store.dispatch(
                  addMessage(
                    `Your have ${typeDST === IN_DST ? "entered" : "left"} DST, should we adjust your notification schedule time?`,
                    toastParams,
                    false
                  )
                );
              }
            });
        }
      });
  };

  render() {
    //  While running e2e tests console.disableYellowBox = true;
    return (
      <Provider store={store}>
        <NavigationContainer ref={navigationRef}>
          <View style={styles.container}>
            <Draggable />
            <UniversalReviewModal />
            <BaseNavigator />
            <ToastMessage />
            <Toast config={toastConfig} topOffset={0} />
            <StopSessionLogs />
            <LowBatteryModal />
            <PumpAdder />
          </View>
        </NavigationContainer>
      </Provider>
    );
  }
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(212, 236, 246)",
  },
  flexRow: {
    flexDirection: "row"
  },
  toastContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    ...ifIphoneX({
      paddingTop: 45
    }, {
      paddingTop: 25
    }),
    width: "100%",
    backgroundColor: Colors.blue,
  },
  toastMainText: {
    color: Colors.white,
    fontSize: 14,
    ...Fonts.SemiBold,
    textAlign: "center",
    marginBottom: 10,
  },
  toastCTAButton: {
    backgroundColor: Colors.blueCTA,
    marginHorizontal: 10,
    paddingVertical: 0,
    height: 35
  },
  btnMain: {
    backgroundColor: Colors.lightBlue
  },
  btnText: {
    color: Colors.white,
    fontSize: 14,
    ...Fonts.SemiBold,
    marginTop: 4
  }
});
