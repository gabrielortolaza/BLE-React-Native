import React, { Component } from "react";
import {
  View,
  Image,
  TouchableOpacity
} from "react-native";
import PropTypes from "prop-types";

import StyleSheet from "../../Proportional";
import { Fonts, Colors } from "../../Themes";
import Label from "./Label";
import Icon from "./Icon";

export default class RowItem extends Component {
  renderContent(children) {
    const {
      centerSubTitle, iconImage, style,
      subTitle, title, onPress,
      testID
    } = this.props;

    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        testID={testID}
      >
        {!!iconImage && <Image style={styles.icon} source={iconImage} />}
        <View style={styles.content}>
          {!!title && (
            <Label style={styles.title}>{title}</Label>
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
      children
    } = this.props;

    if (children) {
      return this.renderContent(children);
    }
    return this.renderContent(<Icon style={styles.arrow} name="chevron-forward" />);
  }
}

const styles = StyleSheet.createProportional({
  container: {
    paddingHorizontal: 25,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderBottomWidth: 1
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 20
  },
  content: {
    flex: 1,
    marginRight: 20
  },
  title: {
    ...Fonts.SemiBold,
    fontSize: 13,
    color: Colors.greyishBrown
  },
  subTitle: {
    ...Fonts.SemiBold,
    fontSize: 12,
    color: Colors.warmGrey,
    marginTop: 5,
  },
  centerSubTitle: {
    textAlign: "center"
  },
  arrow: {
    opacity: 0,
    color: Colors.grey,
    fontSize: 15
  }
});

RowItem.propTypes = {
  centerSubTitle: PropTypes.bool,
  children: PropTypes.element,
  iconImage: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.object]),
  onPress: PropTypes.func,
  style: PropTypes.object,
  subTitle: PropTypes.string,
  title: PropTypes.string,
  testID: PropTypes.string
};
