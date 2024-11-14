import React, { Component } from "react";
import {
  View, Image, StyleSheet,
  TouchableOpacity
} from "react-native";
import PropTypes from "prop-types";

import { Fonts, Colors } from "../../Themes";
import Button from "./Button";
import Label from "./Label";
import Icon from "./Icon";

const RADIO_TYPE = "radio";
const CHECK_TYPE = "check";

export default class ModalRowItem extends Component {
  renderContent(children) {
    const {
      centerSubTitle, image, icon,
      iconType, iconColor, style,
      subTitle, title, activeLevel,
      onPress
    } = this.props;

    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.container, style]}
      >
        {!!image && <Image style={styles.image} source={image} /> }
        {
          !!icon && (
            <Icon
              type={iconType || "MaterialIcons"}
              style={[
                styles.iconStyle,
                { color: iconColor || Colors.blue }
              ]}
              name={icon}
            />
          )
        }
        <View style={styles.content}>
          {!!title && (
            <Label
              style={[
                styles.title,
                activeLevel === 2 && styles.activeLevel2
              ]}
            >
              {title}
            </Label>
          )}
          {!!subTitle && (
            <Label
              style={[
                styles.subTitle,
                centerSubTitle && styles.centerSubTitle
              ]}
            >
              {subTitle}
            </Label>
          )}
        </View>
        {children}
      </TouchableOpacity>
    );
  }

  render() {
    const {
      onPress, isSelected, type,
      children
    } = this.props;

    if (children) {
      return this.renderContent(children);
    }

    if (type === RADIO_TYPE) {
      return this.renderContent(
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.radioBackground}
          onPress={onPress}
        >
          <View
            style={
              isSelected
                ? styles.radioDotSelected
                : styles.radioDot
            }
          />
        </TouchableOpacity>
      );
    }

    if (type === CHECK_TYPE) {
      return (
        <Button onPress={onPress}>
          {this.renderContent(
            isSelected && <Icon style={styles.check} name="checkmark" />
          )}
        </Button>
      );
    }

    return (
      <Button onPress={onPress}>
        {this.renderContent(<Icon style={styles.arrow} name="chevron-forward" />)}
      </Button>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
  },
  image: {
    width: 24,
    height: 24,
    marginRight: 20
  },
  content: {
    flex: 1,
    marginRight: 20
  },
  title: {
    ...Fonts.Medium,
    fontSize: 14,
    color: Colors.grey,
  },
  subTitle: {
    ...Fonts.Medium,
    fontSize: 10,
    color: Colors.greyWarm
  },
  centerSubTitle: {
    textAlign: "center"
  },
  check: {
    marginRight: 8,
    color: Colors.lightBlue,
    fontSize: 20
  },
  arrow: {
    marginRight: 8,
    color: Colors.grey,
    fontSize: 20
  },
  iconStyle: {
    color: Colors.blue,
    fontSize: 25,
    marginRight: 20
  },
  radioBackground: {
    width: 20,
    height: 20,
    borderRadius: 10,
    padding: 6,
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
  activeLevel2: {
    ...Fonts.Bold,
    fontSize: 16,
  },
  activeLevel1: {
    fontSize: 14
  }
});

ModalRowItem.propTypes = {
  centerSubTitle: PropTypes.bool,
  isSelected: PropTypes.bool,
  type: PropTypes.string,
  children: PropTypes.element,
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  iconColor: PropTypes.string,
  iconType: PropTypes.string,
  onPress: PropTypes.func,
  style: PropTypes.object,
  subTitle: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  activeLevel: PropTypes.number,
};
