import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  TouchableOpacity, View,
} from "react-native";

import { Colors } from "../../Themes";
import StyleSheet from "../../Proportional";

export default class Checkable extends PureComponent {
  render() {
    const {
      children, style, selected,
      onPress, testID, checkBoxStyle
    } = this.props;

    return (
      <View style={[styles.container, style]}>
        <View
          style={styles.checkBoxView}
        >
          <TouchableOpacity
            testID={testID}
            style={[styles.checkbox, checkBoxStyle]}
            onPress={onPress}
            activeOpacity={0.9}
          >
            <View
              style={
                selected
                  ? styles.radioDotSelected
                  : styles.radioDot
              }
            />
          </TouchableOpacity>
        </View>
        <View style={styles.childrenView}>
          {children}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.createProportional({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%"
  },
  checkBoxView: {},
  childrenView: {},
  checkbox: {
    width: 25,
    height: 25,
    backgroundColor: Colors.backgroundTwo,
    marginRight: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 2,
    borderColor: Colors.lightBlue
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "transparent"
  },
  radioDotSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.blue
  },
});

Checkable.propTypes = {
  children: PropTypes.any.isRequired,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  checkBoxStyle: PropTypes.object,
  selected: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  testID: PropTypes.string
};
