import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";

import { Colors } from "../../Themes";
import StyleSheet from "../../Proportional";
import { hourRowHeight } from "./Constants";
import { Label } from "../Shared";

export default class HoursColumnLabel extends React.PureComponent {
  render() {
    const { hour } = this.props;
    return (
      <View style={styles.outer}>
        <Label
          key={hour}
          testID={`Schedule_HC_${hour.replace(" ", "_")}`}
          style={styles.hourLabel}
        >
          {hour}
        </Label>
      </View>
    );
  }
}

HoursColumnLabel.propTypes = {
  hour: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  outer: {
    height: hourRowHeight,
    lineHeight: hourRowHeight,
    justifyContent: "flex-start",
  },
  hourLabel: {
    color: Colors.grey,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  }
});
