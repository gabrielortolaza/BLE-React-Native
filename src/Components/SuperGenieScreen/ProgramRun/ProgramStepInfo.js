import React, { useState, useEffect } from "react";
import {
  View, TouchableOpacity, StyleSheet,
  Platform
} from "react-native";
import moment from "moment";
import PropTypes from "prop-types";

import { Colors } from "../../../Themes";
import { InfoLabel, Label } from "../../Shared";
import Icon from "../../Shared/Icon";

const FORWARD = 1;
const BACKWARD = -1;

const ProgramStepInfo = (props) => {
  const { index, data } = props;

  const [onPosition, setOnPosition] = useState(index || 0);

  let duration = data.length > 0 ? data[onPosition].duration : 0;
  duration = moment.utc(duration * 1000).format("mm:ss");

  const canGoBack = onPosition > 0;
  const canGoForward = (onPosition + 1) <= (data.length - 1);

  useEffect(() => {
    setOnPosition(index);
  }, [index]);

  const changePosition = (dir) => {
    if (dir === FORWARD) {
      if (canGoForward) {
        setOnPosition(onPosition + 1);
      }
    } else if (dir === BACKWARD) {
      if (canGoBack) {
        setOnPosition(onPosition - 1);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Label style={styles.stepText} weightSemiBold maxFontSizeMultiplier={1.1} blue>
        {`${onPosition === index ? "Now on " : ""}Step ${onPosition + 1}`}
      </Label>
      <Label style={styles.durationText} weightBold maxFontSizeMultiplier={1.1}>
        {duration}
      </Label>
      <View style={styles.positionBtnsView}>
        {canGoBack ? (
          <TouchableOpacity
            onPress={() => changePosition(BACKWARD)}
            style={styles.positionBtnView}
          >
            <Icon
              name="chevron-back"
              style={styles.arrow}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.positionBtnViewEmpty} />
        )}
        {canGoForward ? (
          <TouchableOpacity
            onPress={() => changePosition(FORWARD)}
            style={styles.positionBtnView}
          >
            <Icon
              name="chevron-forward"
              style={styles.arrow}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.positionBtnViewEmpty} />
        )}
      </View>
      <View style={styles.vacCycOuterView}>
        <InfoLabel
          title="VACUUM"
          value={data.length > 0 ? data[onPosition].vacuum : 0}
          style={styles.vacCycView}
        />
        <View style={styles.dividerLine} />
        <InfoLabel
          title="CYCLE"
          value={data.length > 0 ? data[onPosition].cycle : 0}
          style={styles.vacCycView}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    width: "90%",
    height: Platform.OS === "ios" ? 115 : 130,
    backgroundColor: Colors.white,
    borderColor: "rgba(141, 156, 177, 0.08)",
    borderWidth: 1
  },
  stepText: {
    alignSelf: "center",
    marginTop: 10
  },
  durationText: {
    alignSelf: "center",
    marginTop: Platform.OS === "ios" ? 4 : 0
  },
  positionBtnsView: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: -12
  },
  positionBtnViewEmpty: {
    height: 22
  },
  positionBtnView: {
    backgroundColor: Colors.blue,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center"
  },
  arrow: {
    color: Colors.white,
    fontSize: 12
  },
  vacCycOuterView: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  dividerLine: {
    width: 1,
    height: 35,
    backgroundColor: "rgba(244, 246, 248, 1)"
  },
  vacCycView: {
    width: 85
  }
});

ProgramStepInfo.propTypes = {
  data: PropTypes.array,
  index: PropTypes.number
};

export default ProgramStepInfo;
