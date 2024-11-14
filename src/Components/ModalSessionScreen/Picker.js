import React, { PureComponent } from "react";
import { View, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import StyleSheet from "../../Proportional";
import { Label } from "../Shared";
import { Colors } from "../../Themes";
import Icon from "../Shared/Icon";

export default class Picker extends PureComponent {
  render() {
    const { breastType, onChange } = this.props;

    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "90%",
          margin: 20
        }}
      >
        <TouchableOpacity
          onPress={() => onChange("breastType", "right")}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {breastType === "right" && (
            <Icon style={styles.checkIcon} name="md-checkmark" />
          )}
          <Label
            font16
            weightBold
            style={{
              color: breastType === "right" ? Colors.black : Colors.greyWarm
            }}
          >
            Right
          </Label>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange("breastType", "left")}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {breastType === "left" && (
            <Icon style={styles.checkIcon} name="md-checkmark" />
          )}
          <Label
            font16
            weightBold
            style={{
              color: breastType === "left" ? Colors.black : Colors.greyWarm
            }}
          >
            Left
          </Label>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange("breastType", "double")}
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {breastType === "double" && (
            <Icon style={styles.checkIcon} name="md-checkmark" />
          )}
          <Label
            font16
            weightBold
            style={{
              color: breastType === "double" ? Colors.black : Colors.greyWarm
            }}
          >
            Both
          </Label>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.createProportional({
  checkIcon: {
    color: Colors.blue,
    fontSize: 15,
    alignSelf: "center",
    marginHorizontal: 2
  }
});

Picker.propTypes = {
  breastType: PropTypes.string,
  onChange: PropTypes.func
};
