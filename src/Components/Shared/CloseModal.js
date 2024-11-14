import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import StyleSheet from "../../Proportional";
import { Colors, Fonts } from "../../Themes";
import Button from "./Button";

export default class CloseModal extends PureComponent {
  render() {
    const { title, onPress } = this.props;
    return (
      <Button
        testID="CloseModal"
        onPress={onPress}
        positionStyle={styles.positionStyle}
        contentStyle={styles.contentStyle}
        shapeStyle={styles.shapeStyle}
        titleStyle={styles.text}
        title={title || "Close"}
      />
    );
  }
}

const styles = StyleSheet.createProportional({
  positionStyle: {
    marginLeft: 20,
    marginTop: 10,
    zIndex: 1000
  },
  shapeStyle: {
    width: 62,
    height: 40
  },
  contentStyle: {
    flex: 1
  },
  text: {
    fontSize: 12,
    ...Fonts.SemiBold,
    color: Colors.warmGrey,
    textAlign: "center"
  }
});

CloseModal.propTypes = {
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string
};
