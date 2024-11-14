import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import AppHeaderButton from "./AppHeaderButton";
import { Colors } from "../../../Themes";

export default class AppHeaderBattery extends PureComponent {
  render() {
    const { transparent, statusBattery = 0, onPress } = this.props;

    let batteryCount = 0;
    let iconColor = Colors.greyishBrown;
    if (statusBattery >= 95) {
      batteryCount = 4;
      iconColor = Colors.lightGreen;
    } else if (statusBattery >= 75) {
      batteryCount = 3;
      iconColor = Colors.lightGreen;
    } else if (statusBattery >= 50) {
      batteryCount = 2;
      iconColor = Colors.orange;
    } else if (statusBattery >= 25) {
      batteryCount = 1;
      iconColor = Colors.peach;
    } else if (statusBattery >= 5) {
      batteryCount = 1;
      iconColor = Colors.red;
    }

    const batteryIcon = `battery-${batteryCount}`;

    return (
      <AppHeaderButton
        transparent={transparent}
        type="FontAwesome"
        icon={batteryIcon}
        iconColor={iconColor}
        title={`${statusBattery}%`}
        small
        onPress={onPress}
      />
    );
  }
}

AppHeaderBattery.propTypes = {
  statusBattery: PropTypes.number,
  transparent: PropTypes.bool,
  onPress: PropTypes.func,
};
