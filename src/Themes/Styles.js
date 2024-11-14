import { Platform } from "react-native";
import { hasNotch } from "react-native-device-info";

import Fonts from "./Fonts";
import Colors from "./Colors";

export default {
  Title1: {
    fontSize: 50,
    ...Fonts.Light,
    minHeight: 60,
    lineHeight: Platform.OS === "ios" ? 60 : null,
    textAlignVertical: "center"
  },
  SubTitle1: {
    ...Fonts.SemiBold,
    fontSize: 20,
    letterSpacing: 1.25,
    textAlign: "left"
  },
  TipLabel1: {
    opacity: 0.6,
    ...Fonts.SemiBold,
    fontSize: 10,
    letterSpacing: 0.62,
    textAlign: "left"
  },
  globalTabHeader: {
    paddingTop: hasNotch() ? 50 : (Platform.OS === "ios" ? 45 : 0)
  },
  internalContainer: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? (hasNotch() ? 50 : 45) : 0,
    backgroundColor: Colors.background
  },
  textBlue: {
    color: Colors.blue
  },
  fullWidth: {
    width: "100%"
  },
  fullHeight: {
    height: "100%"
  },
  flexRow: {
    flexDirection: "row"
  }
};
