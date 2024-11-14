import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import Label from "../Label";
import { Colors, Fonts } from "../../../Themes";
import Icon from "../Icon";

const Header = (props) => {
  const {
    leftActionText, leftActionEvent, textStyle,
    leftButtonStyle, showHeaderSeparator, renderRightAction,
  } = props;

  const usedContainerStyle = [
    styles.container,
    showHeaderSeparator && styles.separator,
  ];

  const rightAction = useMemo(
    () => renderRightAction && renderRightAction(),
    [renderRightAction]
  );

  return (
    <View style={usedContainerStyle}>
      <TouchableOpacity
        onPress={leftActionEvent}
        style={[styles.backBtnView, leftButtonStyle]}
      >
        <Icon style={styles.backIcon} name="chevron-back" />
      </TouchableOpacity>
      <Label style={[styles.leftText, textStyle]}>
        {leftActionText}
      </Label>
      <View style={styles.rightAction}>
        {rightAction}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  backBtnView: {
    padding: 8,
    marginLeft: 8,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.grey,
  },
  leftText: {
    marginLeft: 10,
    ...Fonts.SemiBold,
    fontSize: 22,
  },
  rightAction: {
    position: "absolute",
    right: 24,
  },
  separator: {
    borderBottomColor: Colors.grey242,
    borderBottomWidth: 1,
  },
});

Header.propTypes = {
  leftActionText: PropTypes.string,
  leftActionEvent: PropTypes.func,
  leftButtonStyle: PropTypes.object,
  textStyle: PropTypes.object,
  renderRightAction: PropTypes.func,
  showHeaderSeparator: PropTypes.bool,
};

export default Header;
