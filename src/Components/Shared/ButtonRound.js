import React, { PureComponent } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import { Colors } from "../../Themes";

export default class ButtonRound extends PureComponent {
  render() {
    const {
      mb10, mt10, alt,
      shadow, primary, white,
      light, style, blue,
      windowsBlue, large, icon,
      children, testID, pink,
      greyLight, lightGrey2, bordered,
      ...props
    } = this.props;

    const usedStyles = [
      styles.container,
      shadow ? styles.shadow : styles.noShadow,
      (mb10) && styles.mb10,
      (mt10) && styles.mt10,
      (white || (alt && primary)) && styles.backgroundWhite,
      (alt && light) && styles.altLight,
      greyLight && styles.greyLight,
      blue && styles.backgroundBlue,
      lightGrey2 && styles.backgroundLightGrey2,
      windowsBlue && styles.backgroundWindowsBlue,
      pink && styles.backgroundPink,
      large && styles.large,
      bordered && styles.border,
      style,
      props.disabled && styles.disabled,
    ];

    if (!alt) {
      props.primary = primary;
      props.light = light;
    }

    return (
      <TouchableOpacity
        testID={testID}
        {...props}
        style={usedStyles}
      >
        {
          icon
            ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  style={styles.innerImage}
                  source={icon}
                  resizeMode="contain"
                />
                {children}
              </View>
            )
            : children
        }
      </TouchableOpacity>
    );
  }
}

ButtonRound.propTypes = {
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  bordered: PropTypes.bool,
  children: PropTypes.any,
  mb10: PropTypes.bool,
  mt10: PropTypes.bool,
  alt: PropTypes.bool,
  shadow: PropTypes.bool,
  primary: PropTypes.bool,
  white: PropTypes.bool,
  light: PropTypes.bool,
  greyLight: PropTypes.bool,
  blue: PropTypes.bool,
  lightGrey2: PropTypes.bool,
  windowsBlue: PropTypes.bool,
  pink: PropTypes.bool,
  large: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.number,
  testID: PropTypes.string
};

const styles = {
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25, // rounded props issue in android
    height: 50,
    minWidth: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
  },

  innerImage: {
    marginRight: 5,
    width: 20,
    height: 20,
  },

  large: {
    paddingHorizontal: 30
  },

  backgroundBlue: { backgroundColor: Colors.blue },
  backgroundLightGrey2: { backgroundColor: Colors.lightGrey2 },
  backgroundWindowsBlue: { backgroundColor: Colors.windowsBlue },

  backgroundPink: { backgroundColor: Colors.pink },

  mb10: {
    marginBottom: 10,
  },

  mt10: {
    marginTop: 10,
  },

  backgroundWhite: {
    backgroundColor: Colors.white
  },

  altLight: {
    backgroundColor: Colors.white30p
  },
  shadow: {
    elevation: 5,
    shadowColor: "rgba(0, 0, 0, 1)",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.2
  },
  greyLight: {
    backgroundColor: Colors.grey242
  },
  noShadow: {
    elevation: 0
  },
  disabled: {
    backgroundColor: Colors.greyWarm
  },
  border: {
    borderColor: Colors.lightGrey2,
    borderWidth: 1,
  },
};
