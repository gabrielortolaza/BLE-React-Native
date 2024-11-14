import React from "react";
import {
  TouchableOpacity, Image, StyleSheet
} from "react-native";
import PropTypes from "prop-types";

import { Colors, Images } from "../../Themes";
import { Label } from "../Shared";

export default function SessionSwitcher(props) {
  const { sessionType, onChange } = props;

  const usedContainerStyle = [
    styles.container,
    sessionType === "pump"
      ? { backgroundColor: Colors.backgroundBlue }
      : { backgroundColor: Colors.backgroundLightGreen },
  ];

  const usedTitleStyle = [
    sessionType === "pump"
      ? { color: Colors.blue }
      : { color: Colors.lightBlue },
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onChange?.("sessionType", sessionType === "pump" ? "feed" : "pump")}
      style={usedContainerStyle}
    >
      <Image
        source={sessionType === "pump" ? Images.pumpIcon : Images.feedIcon}
        style={styles.pumpImg}
      />
      <Label weightSemiBold style={usedTitleStyle}>
        {sessionType === "pump" ? "PUMPED" : "NURSED"}
      </Label>
    </TouchableOpacity>
  );
}

SessionSwitcher.propTypes = {
  sessionType: PropTypes.string,
  onChange: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    width: "auto",
    height: 30,
    borderRadius: 15,
    padding: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pumpImg: {
    width: 25,
    height: 25,
    marginRight: 4,
  }
});
