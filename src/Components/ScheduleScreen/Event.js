import React from "react";
import {
  TouchableOpacity,
  View,
  Image
} from "react-native";
import moment from "moment";
import PropTypes from "prop-types";

import StyleSheet from "../../Proportional";
import { Colors, Images } from "../../Themes";

import {
  dayColumnWidth,
  hoursColumnWidth,
  hourRowHeight,
  hourSubRowDuration,
  hourSubRowHeight
} from "./Constants";

const Event = (props) => {
  const {
    startsAt, duration, eventKey, onPress, location
  } = props;
  const momentStartsAt = moment(startsAt, "x");
  const style = {
    top: (momentStartsAt.hours() * hourRowHeight) + (momentStartsAt.minutes() / hourSubRowDuration) * hourSubRowHeight,
    height: (duration / hourSubRowDuration) * hourSubRowHeight,
    left: (momentStartsAt.day() * dayColumnWidth) + hoursColumnWidth,
    width: dayColumnWidth
  };

  const testID = `Schedule_MK_${location.x}_${location.y}_${duration}`;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      testID={testID}
      style={[styles.container, style]}
      onPress={({ nativeEvent }) => onPress(nativeEvent, style, eventKey)}
    >
      <View style={styles.markFaceWrapper}>
        <Image source={Images.face} />
      </View>
    </TouchableOpacity>
  );
};

export default Event;

const styles = StyleSheet.createProportional({
  container: {
    position: "absolute",
    backgroundColor: Colors.lightBlue,
    zIndex: 20
  },
  markFaceWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

Event.propTypes = {
  startsAt: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  eventKey: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};
