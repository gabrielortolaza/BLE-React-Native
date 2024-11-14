import { StackActions } from "@react-navigation/native";
import * as React from "react";
import { enterManualMode } from "../Actions";

import store from "../New_Store";

export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

export const replace = (name) => {
  navigationRef.current.dispatch(StackActions.replace(name));
};

export const onAddSession = (
  selection,
  resetLog,
  sessionStart,
  defaultSessionType
) => {
  resetLog();

  switch (selection) {
    case "manual":
      sessionStart("manual", defaultSessionType);
      navigate("SessionModal", { actionType: "manual", newSession: true });
      break;
    case "record":
      sessionStart("record", defaultSessionType);
      navigate("SessionModal", { actionType: "record" });
      break;
    case "genie":
      navigate("SuperGenie");
      break;

    default:
      break;
  }
};

export const onChangePlayMode = (selection) => {
  switch (selection) {
    case "program":
      navigate("SuperGenie");
      break;

    case "manual":
      navigate("SuperGenie", { type: "manual" });
      setTimeout(() => {
        store.dispatch(enterManualMode(true));
      }, 500);
      break;

    default:
      break;
  }
};

export const startPairing = (fromPage = null) => {
  navigate("GeniePairing", { from: fromPage });
};
