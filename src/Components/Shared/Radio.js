import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import PropTypes from "prop-types";

import { Colors } from "../../Themes";
import Label from "./Label";

const Radio = ({ isSelected, label, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
    >
      <View style={styles.radioBackground}>
        <View
          style={
            isSelected
              ? styles.radioDotSelected
              : styles.radioDot
          }
        />
      </View>
      <Label weightSemiBold font12>{label}</Label>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 4,
  },
  radioBackground: {
    width: 20,
    height: 20,
    borderRadius: 10,
    padding: 6,
    marginRight: 10,
    backgroundColor: Colors.windowsBlue15P
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
    backgroundColor: Colors.windowsBlue
  },
});

Radio.propTypes = {
  label: PropTypes.string,
  isSelected: PropTypes.bool,
  onPress: PropTypes.func,
};

export default Radio;
