import React from "react";
import PropTypes from "prop-types";
import {
  View, TouchableOpacity, StyleSheet, Platform,
} from "react-native";
import firebase from "@react-native-firebase/app";

import { Colors } from "../../../Themes";
import Icon from "../Icon";
import Text from "../Label";
import * as C from "../../../Config/constants";

class ControlButton extends React.PureComponent {
  render() {
    const { source, onPress } = this.props;
    return (
      <TouchableOpacity
        style={styles.controlButtonInnerView}
        onPress={onPress}
      >
        <Icon
          type="AntDesign"
          name={source}
          style={styles.controlButtonInnerViewImage}
        />
      </TouchableOpacity>
    );
  }
}

ControlButton.propTypes = {
  source: PropTypes.string,
  onPress: PropTypes.func,
};

class ControlLabel extends React.PureComponent {
  render() {
    const {
      label, value, onPress
    } = this.props;
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
        <Text weightBold font20 mt10>
          {value}
        </Text>
      </View>
    );
  }
}

ControlLabel.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  onPress: PropTypes.func,
};

export default class PumpControl extends React.Component {
  changeVal(type, increment) {
    const {
      options, index, onValueChange,
      warnMsg, strength, speed
    } = this.props;
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
  }

  renderPlay(playStatus) {
    if (playStatus === C.OP_START) {
      return (
        <Icon
          style={styles.playPauseBtn}
          name="pause-circle"
          type="Ionicons"
        />
      );
    }

    if (playStatus === C.OP_STOP || playStatus === C.OP_PAUSE) {
      return (
        <Icon
          style={styles.playPauseBtn}
          name="play-circle"
          type="Ionicons"
        />
      );
    }
  }

  render() {
    const {
      onPlay, onPause, playStatus,
      onStop, hideVcCc, onNavigate,
      strength, speed, hideControlLabel
    } = this.props;
    return (
      <View style={styles.outerWrapper}>
        <View style={styles.btmWrapper}>
          {!hideVcCc && (
            <View style={styles.container}>
              {!hideControlLabel && (
                <ControlLabel
                  label="Vacuum"
                  value={strength}
                  onPress={() => onNavigate("Vacuum", strength)}
                />
              )}
              <View style={styles.subContainer}>
                <ControlButton
                  source="minuscircleo"
                  onPress={() => this.changeVal("vacuum", false)}
                />
                <ControlButton
                  source="pluscircleo"
                  onPress={() => this.changeVal("vacuum", true)}
                />
              </View>
            </View>
          )}
          {!hideVcCc && (
            <View style={styles.container}>
              {!hideControlLabel && (
                <ControlLabel
                  label="Cycle"
                  value={speed}
                  onPress={() => onNavigate("Cycle", speed)}
                />
              )}
              <View style={styles.subContainer}>
                <ControlButton
                  source="minuscircleo"
                  onPress={() => this.changeVal("cycle", false)}
                />
                <ControlButton
                  source="pluscircleo"
                  onPress={() => this.changeVal("cycle", true)}
                />
              </View>
            </View>
          )}
        </View>
        <View style={styles.upperWrapper}>
          <TouchableOpacity
            style={styles.playButtonView}
            onPress={() => {
              playStatus === C.OP_START ? onPause() : onPlay();
            }}
          >
            {this.renderPlay(playStatus)}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onStop()}
            style={styles.stopButtonView}
          >
            <Icon
              name="stop-circle"
              type="FontAwesome"
              style={styles.stopBtn}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

PumpControl.propTypes = {
  speed: PropTypes.number,
  strength: PropTypes.number,
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onStop: PropTypes.func,
  options: PropTypes.object,
  warnMsg: PropTypes.func,
  index: PropTypes.object,
  onValueChange: PropTypes.func,
  onNavigate: PropTypes.func,
  playStatus: PropTypes.number,
  hideVcCc: PropTypes.bool,
  hideControlLabel: PropTypes.bool
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "35%",
    marginTop: 20,
    justifyContent: "flex-end"
  },
  subContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginTop: 5
  },
  playButtonView: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 65
  },
  stopButtonView: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 20
  },
  controlButtonInnerView: {
    padding: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  controlButtonInnerViewImage: {
    fontSize: 30,
    color: Colors.blue,
  },
  controlLabel: {
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? -40 : -44
  },
  playPauseBtn: {
    fontSize: 70,
    color: Colors.blue,
  },
  stopBtn: {
    fontSize: 38,
    color: Colors.coral,
  },
  outerWrapper: {
    width: "100%"
  },
  upperWrapper: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 25
  },
  btmWrapper: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25
  }
});
