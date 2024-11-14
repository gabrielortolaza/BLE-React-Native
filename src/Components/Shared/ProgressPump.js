import React, { useMemo } from "react";
import {
  Image, StyleSheet, View,
} from "react-native";
import PropTypes from "prop-types";
import { CircularProgressBase } from "react-native-circular-progress-indicator";

import { Colors, Images } from "../../Themes";
import Label from "./Label";
import { PUMP_DEVICE } from "../../Config/constants";

const ProgressPump = ({
  statusBattery, radius, strokeWidth,
  imageSize, showLabel, variant,
}) => {
  const getStrokeColor = useMemo(() => {
    let strokeColor = Colors.lightGrey300;
    if (statusBattery > 20) {
      strokeColor = Colors.lightBlue;
    } else if (statusBattery > 0) {
      strokeColor = Colors.coral;
    }
    return strokeColor;
  }, [statusBattery]);

  const getImage = useMemo(() => {
    let image;
    if (variant === PUMP_DEVICE.WEARABLE) {
      image = statusBattery > 0 ? Images.wearablepump : Images.wearablepumpDisable;
    } else if (variant === PUMP_DEVICE.SUPERGENIE) {
      image = statusBattery > 0 ? Images.supergenie : Images.supergenieDisable;
    }
    return image;
  }, [variant, statusBattery]);

  return (
    <CircularProgressBase
      value={statusBattery}
      radius={radius}
      progressValueColor={getStrokeColor}
      activeStrokeColor={getStrokeColor}
      inActiveStrokeColor={Colors.lightGrey}
      inActiveStrokeOpacity={0.5}
      inActiveStrokeWidth={strokeWidth}
      activeStrokeWidth={strokeWidth}
    >
      <View style={[styles.dot,
        { backgroundColor: getStrokeColor, width: strokeWidth + 4, height: strokeWidth + 4 }
      ]}
      />
      <View style={styles.innerContainer}>
        <Image
          source={getImage}
          style={[styles.innerImage, { width: imageSize, height: imageSize }]}
        />
        {showLabel && (
          <Label weightSemiBold style={[styles.innerLabel, { color: getStrokeColor }]}>
            {`${statusBattery}%`}
          </Label>
        )}
      </View>
    </CircularProgressBase>
  );
};

ProgressPump.propTypes = {
  statusBattery: PropTypes.number.isRequired,
  radius: PropTypes.number.isRequired,
  strokeWidth: PropTypes.number,
  imageSize: PropTypes.number,
  showLabel: PropTypes.bool,
  variant: PropTypes.string,
};

const styles = StyleSheet.create({
  innerContainer: {
    alignItems: "center",
  },
  dot: {
    position: "absolute",
    top: -2,
    borderRadius: 4,
  },
  innerImage: {
    width: 25,
    height: 25,
  },
  innerLabel: {
    marginTop: 4,
  }
});

export default ProgressPump;
