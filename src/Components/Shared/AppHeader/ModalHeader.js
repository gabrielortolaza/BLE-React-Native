import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import Label from "../Label";
import { Colors } from "../../../Themes";
import Icon from "../Icon";

const ModalHeader = ({ title, style, onClose }) => {
  return (
    <View style={[styles.titleWrapper, style]}>
      <Label font16 weightSemiBold>
        {title}
      </Label>
      <TouchableOpacity
        style={styles.closeIconContainer}
        onPress={onClose}
      >
        <Icon
          type="Ionicons"
          name="close-outline"
          style={styles.closeIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeIconContainer: {
    padding: 5
  },
  closeIcon: {
    fontSize: 30,
    color: Colors.lightGrey2
  },
});

ModalHeader.propTypes = {
  title: PropTypes.string,
  style: PropTypes.object,
  onClose: PropTypes.func,
};

export default ModalHeader;
