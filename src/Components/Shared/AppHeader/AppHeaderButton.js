import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Image, TouchableOpacity } from "react-native";

import Styles from "./Styles";
import Label from "../Label";
import Icon from "../Icon";

export default class AppHeaderButton extends PureComponent {
  onPress = () => {
    const { onPress } = this.props;
    if (onPress) onPress();
  }

  render() {
    const {
      title,
      icon,
      iconColor,
      image,
      enabled,
      type = "Ionicons",
      transparent,
      red,
      white,
      small
    } = this.props;

    let color = Styles.colorDisabled;
    if (enabled) {
      color = Styles.colorEnabled;
    }
    if (red) {
      color = Styles.colorRed;
    }
    if (white) {
      color = Styles.colorWhite;
    }
    if (iconColor) {
      color = { color: iconColor };
    }

    const iconStyles = [
      Styles.icon,
      color,
      small && Styles.buttonIconSmall
    ];

    const textStyles = [
      // color,
      !!icon && Styles.buttonTextSmall
    ];

    const buttonStyles = [
      Styles.button,
      !transparent ? Styles.buttonWhite : null,
      !!icon && !!title && Styles.buttonIconTop
    ];

    return (
      <TouchableOpacity style={buttonStyles} onPress={this.onPress}>
        {!!icon && (
          <Icon
            type={type}
            name={icon}
            style={iconStyles}
          />
        )}
        {!!image && (
          <Image
            resizeMode="contain"
            source={image}
            style={Styles.image}
          />
        )}
        {!!title && <Label weightSemiBold style={textStyles}>{title}</Label>}
      </TouchableOpacity>
    );
  }
}

AppHeaderButton.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  image: PropTypes.number,
  transparent: PropTypes.bool,
  onPress: PropTypes.func,
  red: PropTypes.bool,
  enabled: PropTypes.bool,
  type: PropTypes.string,
  white: PropTypes.bool,
  small: PropTypes.bool,
};
