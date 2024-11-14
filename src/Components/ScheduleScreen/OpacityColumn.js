import React, { PureComponent } from "react";
import { View } from "react-native";
import PropTypes from "prop-types";

import StyleSheet from "../../Proportional";
import { Colors } from "../../Themes";

export default class OpacityColumn extends PureComponent {
  render() {
    const { index } = this.props;
    return (
      <View
        key={index}
        pointerEvents="none"
        style={[styles.container, index % 2 === 0 ? styles.white : styles.blue]}
      />
    );
  }
}

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    width: 47
  },
  white: {
    backgroundColor: Colors.white
  },
  blue: {
    backgroundColor: Colors.lighterBlue20P
  }
});

OpacityColumn.propTypes = {
  index: PropTypes.number.isRequired
};
