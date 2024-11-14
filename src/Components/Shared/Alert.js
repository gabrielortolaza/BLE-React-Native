import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import PropTypes from "prop-types";

import Icon from "./Icon";
import Label from "./Label";
import { Colors } from "../../Themes";

const Alert = ({ title, onClose, style }) => {
  return (
    <View style={[styles.stashAlertContainer, style]}>
      <Label weightSemiBold>{title}</Label>
      <TouchableOpacity
        style={styles.closeIconWrapper}
        onPress={onClose}
      >
        <Icon name="close" style={styles.closeIcon} />
      </TouchableOpacity>
    </View>
  );
};

Alert.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  style: PropTypes.object,
};

const styles = StyleSheet.create({
  stashAlertContainer: {
    flexDirection: "row",
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  closeIconWrapper: {
    position: "absolute",
    right: 20,
  },
  closeIcon: {
    fontSize: 24,
  },
});

export default Alert;
