import React, { PureComponent } from "react";
import { View } from "react-native";
import PropTypes from "prop-types";

import Text from "./Label";

export default class InfoLabel extends PureComponent {
  render() {
    const { style, title, value } = this.props;
    return (
      <View style={style}>
        <Text maxFontSizeMultiplier={1.1} font12 weightSemiBold center greyWarm>
          {title}
        </Text>
        <Text maxFontSizeMultiplier={1.1} font18 weightSemiBold center>
          {value}
        </Text>
      </View>
    );
  }
}

InfoLabel.propTypes = {
  style: PropTypes.object,
  title: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
};
