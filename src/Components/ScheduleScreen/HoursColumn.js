import React from "react";
import { View } from "react-native";

import { Colors } from "../../Themes";
import StyleSheet from "../../Proportional";

import {
  hoursColumnWidth,
  hours
} from "./Constants";

import HoursColumnLabel from "./HoursColumnLabel";

export default class HoursColumn extends React.PureComponent {
  renderHour = (hour) => <HoursColumnLabel key={hour} hour={hour} />

  render() {
    return (
      <View style={[styles.container]}>
        {hours.map(this.renderHour)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.whiteTwo,
    width: hoursColumnWidth
  }
});
