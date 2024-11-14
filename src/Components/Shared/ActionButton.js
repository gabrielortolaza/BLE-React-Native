import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  Animated,
  Image,
  Platform,
  Text
} from "react-native";

import Button from "./Button";
import { Colors, Fonts } from "../../Themes";

export default class ActionButton extends PureComponent {
  render() {
    const {
      onPress,
      source,
      label,
      contentStyle,
      positionStyle,
      shapeStyle,
      iconStyle,
      small,
      verySmall
    } = this.props;
    const contentStyleList = [
      styles.contentStyle,
      contentStyle
    ];
    return (
      <Animated.View
        style={[styles.container, positionStyle]}
      >
        {!!label && <Text style={styles.label} onPress={onPress}>{label}</Text>}
        <Button
          onPress={onPress}
          positionStyle={styles.positionStyle}
          contentStyle={contentStyleList}
          shapeStyle={[styles.shapeStyle, shapeStyle, small && styles.shapeSmallStyle, verySmall && styles.shapeVerySmallStyle]}
          elevation
        >
          <Image source={source} style={[styles.icon, iconStyle]} />
        </Button>
      </Animated.View>
    );
  }
}

const styles = {
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    padding: Platform.OS === "android" ? 10 : 0
  },
  positionStyle: {
  },
  shapeStyle: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  shapeSmallStyle: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  shapeVerySmallStyle: {
    width: 36,
    height: 36,
    borderRadius: 18
  },
  contentStyle: {
    alignItems: "center",
    backgroundColor: Colors.white,
    flex: 1,
    paddingBottom: 0
  },
  label: {
    fontSize: 14,
    color: Colors.white,
    padding: 10,
    marginRight: 10,
    ...Fonts.SemiBold,
    paddingBottom: Platform.OS === "android" ? 10 : 10
  },
  icon: {
    maxWidth: 20,
    maxHeight: 20
  }
};

const stylePropType = PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.number])), PropTypes.number]);

ActionButton.propTypes = {
  onPress: PropTypes.func.isRequired,
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  label: PropTypes.string,
  positionStyle: stylePropType,
  contentStyle: stylePropType,
  shapeStyle: stylePropType,
  iconStyle: stylePropType,
  small: PropTypes.bool,
  verySmall: PropTypes.bool,
};
