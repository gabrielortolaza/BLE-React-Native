import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet, View, Image, TouchableOpacity, Platform
} from "react-native";
import moment from "moment";

import { Label } from "../../Shared";
import { Colors, Images } from "../../../Themes";
import { EXPRESSION } from "../../../Config/Modes";
import * as C from "../../../Config/constants";
import CircleAnimation from "../Pairing/Components/CircleAnimation";

const PumpCircle = ({
  pumpName, vacuum, cycle, totalTime,
  modeId, playStatus, onPlay
}) => {
  let pumpStatus = STATUS.notstart;
  if (playStatus === C.OP_START) {
    pumpStatus = STATUS.play;
  } else if (playStatus === C.OP_PAUSE) {
    pumpStatus = STATUS.pause;
  } else if (playStatus === C.OP_STOP && totalTime > 0) {
    pumpStatus = STATUS.stop;
  }

  const usedContainerStyle = [
    styles.container,
    playStatus === C.OP_PAUSE && { borderWidth: 8, borderColor: Colors.gold },
    playStatus === C.OP_STOP && { borderWidth: 8, borderColor: Colors.tomato },
    !totalTime && { borderWidth: 0 }
  ];

  const colorLabelStyle = [
    playStatus === C.OP_START && { color: Colors.blue },
    playStatus === C.OP_PAUSE && { color: Colors.gold },
    playStatus === C.OP_STOP && { color: Colors.tomato },
    !totalTime && { color: Colors.lightGrey2 }
  ];

  return (
    <View style={styles.outerContainer}>
      {playStatus === C.OP_START && (
        <CircleAnimation
          initialValue={204}
          targetValue={308}
          duration={1500}
          circleStyle={{ backgroundColor: Colors.backgroundBorder }}
        />
      )}
      <TouchableOpacity style={usedContainerStyle} onPress={onPlay} activeOpacity={0.5}>
        <Image
          source={modeId === EXPRESSION ? Images.expressionBlue : Images.letdownBlue}
          style={styles.modeImage}
        />
        <Label maxFontSizeMultiplier={1} font16 blue style={styles.pumpNameLabel}>{pumpName}</Label>
        <View style={styles.valueContainer}>
          <View style={{ alignItems: "center" }}>
            <Label maxFontSizeMultiplier={1} blue style={styles.valueLabel}>{vacuum}</Label>
            <Label maxFontSizeMultiplier={1} font12 blue>Vacuum</Label>
          </View>
          <View style={{ alignItems: "center" }}>
            <Label maxFontSizeMultiplier={1} blue style={styles.valueLabel}>{cycle}</Label>
            <Label maxFontSizeMultiplier={1} font12 blue>Cycle</Label>
          </View>
        </View>
        <View style={styles.statusTextView}>
          <View style={pumpStatus.style} />
          <Label maxFontSizeMultiplier={1} font12 weightSemiBold style={colorLabelStyle}>
            {pumpStatus.label}
          </Label>
        </View>
        <Label maxFontSizeMultiplier={1} font14 weightSemiBold style={colorLabelStyle}>
          {moment.utc(totalTime * 1000).format("mm:ss")}
        </Label>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginTop: 50,
    width: 204,
    height: 204,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 102,
  },
  container: {
    width: 204,
    height: 204,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 102,
    backgroundColor: Colors.white,
    position: "absolute",
  },
  modeImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  pumpNameLabel: {
    fontWeight: Platform.OS === "android" ? "700" : "600",
    marginTop: 4,
    marginBottom: 6,
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%"
  },
  valueLabel: {
    fontSize: 32,
    fontWeight: "700",
  },
  statusTextView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  ball: {
    backgroundColor: Colors.tomato,
    borderRadius: 6,
    height: 12,
    width: 12,
    marginRight: 8,
  },
});

const STATUS = {
  notstart: { label: "NOT STARTED", style: {} },
  play: { label: "PUMPING...", style: [styles.ball, { backgroundColor: Colors.blue }] },
  pause: { label: "PAUSED", style: [styles.ball, { backgroundColor: Colors.gold }] },
  stop: { label: "STOPPED", style: styles.ball }
};

PumpCircle.propTypes = {
  pumpName: PropTypes.string,
  vacuum: PropTypes.number,
  cycle: PropTypes.number,
  totalTime: PropTypes.number,
  modeId: PropTypes.number,
  playStatus: PropTypes.number,
  onPlay: PropTypes.func,
};

export default PumpCircle;
