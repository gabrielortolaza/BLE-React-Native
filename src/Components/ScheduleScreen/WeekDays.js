import React from "react";
import {
  View
} from "react-native";
import PropTypes from "prop-types";

import { Colors, Fonts } from "../../Themes";
import StyleSheet from "../../Proportional";
import { hoursColumnWidth } from "./Constants";
import { Label } from "../Shared";

class WeekDays extends React.PureComponent {
  render() {
    return (
      <View style={styles.weekDays}>
        <View style={[styles.dayContainer, styles.notDay]} />
        <DayColumn testID="Schedule_WeekDay_1" label="SU" />
        <DayColumn testID="Schedule_WeekDay_2" label="M" alt />
        <DayColumn testID="Schedule_WeekDay_3" label="T" />
        <DayColumn testID="Schedule_WeekDay_4" label="W" alt />
        <DayColumn testID="Schedule_WeekDay_5" label="TH" />
        <DayColumn testID="Schedule_WeekDay_6" label="F" alt />
        <DayColumn testID="Schedule_WeekDay_7" label="S" />
      </View>
    );
  }
}

export default WeekDays;

const DayColumn = ({ label, testID, alt }) => (
  <View style={[styles.dayContainer, alt && styles.dayContainerAlt]}>
    <Label testID={testID} style={styles.dayLabel}>{label}</Label>
  </View>
);

DayColumn.propTypes = {
  alt: PropTypes.bool,
  label: PropTypes.string.isRequired,
  testID: PropTypes.string.isRequired
};

const styles = StyleSheet.createProportional({
  weekDays: {
    flex: 0,
    flexDirection: "row",
    height: 50
  },
  notDay: {
    __skipProportion: true,
    flex: 0,
    borderRightColor: Colors.whiteTwo,
    width: hoursColumnWidth
  },
  dayContainer: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.whiteTwo30p,
    borderBottomColor: Colors.whiteTwo,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  dayContainerAlt: {
    backgroundColor: Colors.duckEggBlue10p
  },
  dayLabel: {
    // transform: [{ rotate: "90deg" }],
    fontSize: 15,
    color: Colors.grey,
    ...Fonts.SemiBold
  }
});
