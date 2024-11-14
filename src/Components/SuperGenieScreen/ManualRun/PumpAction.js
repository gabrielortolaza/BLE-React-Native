import React from "react";
import PropTypes from "prop-types";
import {
  View, TouchableOpacity, StyleSheet,
} from "react-native";

import { Colors } from "../../../Themes";
import * as C from "../../../Config/constants";
import Icon from "../../Shared/Icon";

export default function PumpAction({
  onPlay, onPause, playStatus, onStop
}) {
  const renderPlay = (playStatus) => {
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
  };

  return (
    <View style={styles.outerWrapper}>
      <TouchableOpacity
        style={styles.playButtonView}
        onPress={() => {
          playStatus === C.OP_START ? onPause() : onPlay();
        }}
      >
        {renderPlay(playStatus)}
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
  );
}

PumpAction.propTypes = {
  onPlay: PropTypes.func,
  onPause: PropTypes.func,
  onStop: PropTypes.func,
  playStatus: PropTypes.number,
};

const styles = StyleSheet.create({
  playButtonView: {
    alignItems: "center",
    justifyContent: "center",
  },
  stopButtonView: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    height: "100%",
    right: 60,
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
    width: "90%",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 40,
    elevation: 5,
    shadowColor: Colors.grey,
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.3,
    shadowRadius: 12
  },
});
