import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { View, TouchableOpacity } from "react-native";

import Label from "../Label";
import Styles from "./Styles";
import { Colors } from "../../../Themes";
import Icon from "../Icon";

export default class AppHeader extends PureComponent {
  render() {
    const {
      transparent, absolute, leftActionText,
      leftActionEvent, showBackButton, titleText,
      right, left, body, showMoreButton,
      alt, textStyle, buttonStyle, moreActionEvent,
      leftButtonStyle, backButtonContrast,
      ...props
    } = this.props;

    const textColor = transparent ? Styles.colorWhite : {};

    let leftChildren = null;
    let rightChildren = null;

    if (showBackButton) {
      leftChildren = (
        <TouchableOpacity
          activeOpacity={0.5}
          style={[
            Styles.backButtonContainer,
            backButtonContrast && Styles.backButtonContrast,
            alt && { backgroundColor: Colors.white },
            leftActionText && { width: null },
          ]}
          onPress={leftActionEvent}
        >
          <Icon style={[{ fontSize: 24, color: Colors.grey }, leftButtonStyle]} name="chevron-back" />
          <Label font30 weightBold style={[Styles.leftText, textColor, textStyle]}>
            {leftActionText}
          </Label>
        </TouchableOpacity>
      );
    }

    if (showMoreButton) {
      rightChildren = (
        <TouchableOpacity
          activeOpacity={0.5}
          style={[
            Styles.backButtonContainer,
            backButtonContrast && Styles.backButtonContrast,
            alt && { backgroundColor: Colors.white }
          ]}
          onPress={moreActionEvent}
        >
          <Icon
            name="options-vertical"
            type="SimpleLineIcons"
            style={Styles.moreIcon}
          />
        </TouchableOpacity>
      );
    }

    const headerContainStyles = [Styles.headerContain, !transparent && Styles.white10p];
    const headerStyles = [Styles.header, !transparent && Styles.white10p];

    return (
      <View style={[headerContainStyles, !!absolute && Styles.containerFloating]}>
        <View
          // transparent={transparent} // screen flickering issue in android
          style={headerStyles}
          {...props}
          noShadow
        >
          <View style={{ flex: 1 }}>{leftChildren || left || null}</View>
          {(!!titleText || !!body) && (
            <View style={{ flex: 2 }}>
              {!!titleText && (
                <TouchableOpacity
                  rounded
                  style={[
                    {
                      backgroundColor: "transparent",
                      elevation: 0
                    },
                    buttonStyle
                  ]}
                >
                  <Label
                    style={[
                      transparent && Styles.colorWhite,
                      textStyle,
                      {
                        fontSize: 12
                      }
                    ]}
                    uppercase={false}
                  >
                    {titleText}
                  </Label>
                </TouchableOpacity>
              )}
              {body}
            </View>
          )}
          <View style={{ alignItems: "center" }}>{rightChildren || right || null}</View>
        </View>
      </View>
    );
  }
}

AppHeader.propTypes = {
  titleText: PropTypes.string,
  leftActionText: PropTypes.string,
  leftActionEvent: PropTypes.func,
  moreActionEvent: PropTypes.func,
  absolute: PropTypes.bool,
  transparent: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  showBackButton: PropTypes.bool,
  showMoreButton: PropTypes.bool,
  alt: PropTypes.bool,
  backButtonContrast: PropTypes.bool,
  body: PropTypes.object,
  right: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  left: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  textStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
  leftButtonStyle: PropTypes.object
};
