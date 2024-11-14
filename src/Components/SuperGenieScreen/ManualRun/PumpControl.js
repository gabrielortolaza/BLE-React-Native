import React, { useCallback } from "react";
import PropTypes from "prop-types";
import {
  View, TouchableOpacity, StyleSheet,
} from "react-native";
import firebase from "@react-native-firebase/app";

import { Colors } from "../../../Themes";
import Icon from "../../Shared/Icon";
import Text from "../../Shared/Label";

const ControlButton = ({ source, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.controlButtonInnerView}
      onPress={onPress}
    >
      <Icon
        type="AntDesign"
        name={source}
        style={styles.controlButtonInnerViewIcon}
      />
    </TouchableOpacity>
  );
};

ControlButton.propTypes = {
  source: PropTypes.string,
  onPress: PropTypes.func,
};

const ControlLabel = ({ label, value, onPress }) => {
  return (
    <View style={styles.controlLabel}>
      <Text
        weightBold
        blue
        font14
        style={{ textDecorationLine: "underline" }}
        onPress={onPress}
      >
        {label}
      </Text>
      <Text weightBold font14 mt10>
        {value}
      </Text>
    </View>
  );
};

ControlLabel.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  onPress: PropTypes.func,
};

export default function PumpControl({
  options, index, onValueChange,
  warnMsg, strength, speed,
  hideVcCc, onNavigate, hideControlLabel
}) {
  const changeVal = useCallback((type, increment) => {
    console.log("options:", options, index, speed, strength);
    const event = "Program";

    if (type === "vacuum") {
      if (increment) {
        if (options.vacuum.length > index.vacuum + 1) {
          onValueChange("vacuumStep", index.vacuum + 1, increment);
          firebase.analytics().logEvent(`${event}_vacuum_increase`);
        } else {
          const maxVacuumOptionArr = options.vacuum;
          if (maxVacuumOptionArr.length < 1) return;
          const maxVacuumOption = maxVacuumOptionArr[maxVacuumOptionArr.length - 1];

          warnMsg && maxVacuumOption <= strength && warnMsg("This is the highest vacuum level for this speed");
        }
      } else if (index.vacuum > 0 && options.vacuum[index.vacuum - 1]) {
        onValueChange("vacuumStep", index.vacuum - 1, increment);
        firebase.analytics().logEvent(`${event}_vacuum_decrease`);
      }
    } else if (type === "cycle") {
      if (increment) {
        if (options.cycle.length > index.cycle + 1) {
          onValueChange("cycleStep", index.cycle + 1, increment);
          firebase.analytics().logEvent(`${event}_cycle_increase`);
        } else {
          const maxCycleOptionArr = options.cycle;
          if (maxCycleOptionArr.length < 1) return;
          const maxCycleOption = maxCycleOptionArr[maxCycleOptionArr.length - 1];

          warnMsg && maxCycleOption <= speed && warnMsg("This is the top speed for this vacuum level");
        }
      } else if (index.cycle > 0 && options.cycle[index.cycle - 1]) {
        onValueChange("cycleStep", index.cycle - 1, increment);
        firebase.analytics().logEvent(`${event}_cycle_decrease`);
      }
    }
  }, [index, onValueChange, options, speed, strength, warnMsg]);

  return (
    <View style={styles.outerWrapper}>
      {!hideVcCc && strength && (
        <View style={styles.container}>
          <ControlButton
            source="minus"
            onPress={() => changeVal("vacuum", false)}
          />
          {!hideControlLabel && (
            <ControlLabel
              label="Vacuum"
              value={strength}
              onPress={() => onNavigate("Vacuum", strength)}
            />
          )}
          <ControlButton
            source="plus"
            onPress={() => changeVal("vacuum", true)}
          />
        </View>
      )}
      {!hideVcCc && speed && (
        <View style={styles.container}>
          <ControlButton
            source="minus"
            onPress={() => changeVal("cycle", false)}
          />
          {!hideControlLabel && (
            <ControlLabel
              label="Cycle"
              value={speed}
              onPress={() => onNavigate("Cycle", speed)}
            />
          )}
          <ControlButton
            source="plus"
            onPress={() => changeVal("cycle", true)}
          />
        </View>
      )}
    </View>
  );
}

PumpControl.propTypes = {
  speed: PropTypes.number,
  strength: PropTypes.number,
  options: PropTypes.object,
  warnMsg: PropTypes.func,
  index: PropTypes.object,
  onValueChange: PropTypes.func,
  onNavigate: PropTypes.func,
  hideVcCc: PropTypes.bool,
  hideControlLabel: PropTypes.bool
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "70%",
    marginVertical: 14,
  },
  controlButtonInnerView: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 40,
    borderColor: Colors.backgroundBlue,
    borderWidth: 1,
  },
  controlButtonInnerViewIcon: {
    fontSize: 40,
    color: Colors.blue,
  },
  controlLabel: {
    alignItems: "center",
  },
  outerWrapper: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  }
});
