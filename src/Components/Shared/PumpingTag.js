import React from "react";
import {
  StyleSheet, TouchableOpacity,
} from "react-native";
import PropTypes from "prop-types";

import { Label } from ".";
import { Colors } from "../../Themes";
import Icon from "./Icon";

const PumpingTag = ({
  id, label, isSelected,
  showClear, viewStyle, textStyle,
  onPress, onPressClear, disabled
}) => {
  const usedViewStyle = [
    styles.container,
    viewStyle,
    isSelected ? styles.selectedView : {},
    showClear ? styles.smallPadding : {},
  ];

  return (
    <TouchableOpacity
      disabled={disabled}
      style={usedViewStyle}
      onPress={() => onPress && onPress(id)}
    >
      <Label numberOfLines={1} maxFontSizeMultiplier={1} style={[styles.text, textStyle]}>
        {label}
      </Label>
      {showClear && (
        <Icon
          type="Ionicons"
          name="close-outline"
          style={styles.closeIcon}
          onPress={() => onPressClear && onPressClear()}
        />
      )}
    </TouchableOpacity>
  );
};

PumpingTag.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  isSelected: PropTypes.bool,
  showClear: PropTypes.bool,
  viewStyle: PropTypes.object,
  textStyle: PropTypes.object,
  onPress: PropTypes.func,
  onPressClear: PropTypes.func,
  disabled: PropTypes.bool
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.grey242,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 21,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  smallPadding: {
    paddingRight: 10,
  },
  selectedView: {
    borderWidth: 0.8
  },
  text: {
    fontWeight: "400",
    color: Colors.blackTwo,
    fontSize: 13
  },
  closeIcon: {
    fontSize: 20
  }
});

export default PumpingTag;
