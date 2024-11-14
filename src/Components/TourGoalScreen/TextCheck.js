import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  TouchableOpacity,
  View,
  Text
} from "react-native";

import StyleSheet from "../../Proportional";
import { Colors } from "../../Themes";

export default class Onboarding2TextCheck extends PureComponent {
  render() {
    const {
      selected,
      onPress,
      children
    } = this.props;
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.container}>
          <Text style={styles.text}>{children}</Text>
          <View style={styles.radioOutter}>
            <View style={[styles.radioInner, { opacity: selected ? 1 : 0 }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

Onboarding2TextCheck.propTypes = {
  selected: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  children: PropTypes.string.isRequired
};

const styles = StyleSheet.createProportional({
  container: {
    flexDirection: "row",
    marginVertical: 2,
    width: 110,
    alignItems: "center"
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: "white",
    textAlign: "right"
  },
  radioOutter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white20p,
    padding: 3,
    marginLeft: 6
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white
  }
});
