import { AppRegistry, Platform } from "react-native";
import notifee from "@notifee/react-native";
import database from "@react-native-firebase/database";

import App from "./src/App";
import store from "./src/New_Store";
import { FOREGROUND_SERVICE_PLAY_PROGRAM } from "./src/Config/constants";
import { FOREGROUND_NOTIF_CHANNEL_ID } from "./src/Types";

const NOTIFICATION = { ID: FOREGROUND_SERVICE_PLAY_PROGRAM, NAME: "Play program notification" };

// Text.defaultProps = Text.defaultProps || {};
// Text.defaultProps.allowFontScaling = false;

// COMBAK: Might be able to move to src/App
database().setPersistenceEnabled(true);

let channelId = null;

const registerNotification = async () => {
  channelId = await notifee.createChannel({ id: NOTIFICATION.ID, name: NOTIFICATION.NAME });
  notifee.registerForegroundService((notification) => {
    return new Promise(() => {
      notifee.displayNotification({
        id: `${notification.id}s`,
        title: "Playing program",
        body: "Keeping track of your program in the background",
        android: {
          ...notification.android,
          channelId,
          pressAction: {
            id: "default"
          }
        },
      });
    });
  });

  store.dispatch({
    type: FOREGROUND_NOTIF_CHANNEL_ID,
    payload: channelId
  });
};

if (Platform.OS === "android") {
  registerNotification();
}

AppRegistry.registerComponent("Pumpables", () => App);
