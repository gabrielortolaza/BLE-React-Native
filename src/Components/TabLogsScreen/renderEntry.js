/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { View, Image } from "react-native";

import { Fonts, Colors } from "../../Themes";

import StyleSheet from "../../Proportional";
import { ImageButton, Label as Text } from "../Shared";

const Edit = require("../../Assets/Images/Icons/editCopy.png");
const Delete = require("../../Assets/Images/Icons/deleteCopy.png");

export default class RenderEntry extends PureComponent {
  onPressEdit = () => this.props.onPressEdit(this.props.itemIndex);
  onPressDelete = () => this.props.onPressDelete(this.props.itemIndex);

  render() {
    const {
      largeTitle,
      title,
      subtitle,
      description,
      image,
      onPressEdit,
      onPressDelete,
      imageText
    } = this.props;
    const showEditDelete = onPressEdit && onPressDelete;

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.entrySessionContainer}>
            {!!largeTitle && (
              <Text style={styles.largeTitle}>{largeTitle}</Text>
            )}
            {!!title && <Text style={styles.title}>{title}</Text>}
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {!!description && (
              <Text style={styles.description}>{description}</Text>
            )}
            {showEditDelete && (
              <View style={styles.actions}>
                <ImageButton
                  source={Edit}
                  style={styles.action}
                  onPress={this.onPressEdit}
                />
                <ImageButton
                  source={Delete}
                  style={styles.action}
                  onPress={this.onPressDelete}
                />
              </View>
            )}
          </View>
          {!!image && (
            <View style={styles.image}>
              <Image source={image} style={styles.image} />
              {!!imageText && <Text style={styles.imageText}>{imageText}</Text>}
            </View>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent"
  },
  content: {
    flex: 1,
    marginLeft: 20,
    marginRight: 35,
    marginBottom: 20,
    borderColor: Colors.whiteFive,
    flexDirection: "row"
  },
  actions: {
    flexDirection: "row",
    flex: 1,
    marginTop: 8,
    width: 70,
    justifyContent: "space-between"
  },
  action: {
    alignSelf: "flex-end",
    width: 10,
    height: 10,
    margin: 15
  },
  entrySessionContainer: {
    flex: 1,
    paddingRight: 10
  },
  largeTitle: {
    ...Fonts.SemiBold,
    fontSize: 20,
    color: Colors.greyishBrown,
    marginLeft: 10
  },
  title: {
    ...Fonts.SemiBold,
    fontSize: 14,
    color: Colors.greyishBrown,
    marginLeft: 10,
    marginBottom: 4
  },
  subtitle: {
    ...Fonts.SemiBold,
    fontSize: 10,
    color: Colors.windowsBlue,
    marginLeft: 10
  },
  description: {
    fontSize: 12,
    color: Colors.greyishBrown,
    marginTop: 8,
    marginLeft: 10,
    minHeight: 48
  },
  image: {
    width: 90,
    height: 130
  },
  imageText: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
    ...Fonts.SemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.windowsBlue,
    textAlign: "center",
    marginTop: 12
  }
});

RenderEntry.propTypes = {
  largeTitle: PropTypes.string,
  title: PropTypes.string,
  item: PropTypes.object,
  imageText: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  onPressEdit: PropTypes.func,
  onPressDelete: PropTypes.func
};
