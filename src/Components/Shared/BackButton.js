import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import StyleSheet from "../../Proportional";
import Button from "./Button";
import { Colors } from "../../Themes";
import Icon from "./Icon";

export default class BackButton extends PureComponent {
  render() {
    const {
      alt, onPress, testID, backIconStyle
    } = this.props;

    return (
      <Button
        onPress={onPress}
        lightRipple={alt}
        positionStyle={styles.container}
        shapeStyle={styles.shapeStyle}
        contentStyle={styles.contentStyle}
        testID={testID}
      >
        <Icon
          name="chevron-back"
          style={[
            { color: alt ? Colors.white : Colors.blue },
            styles.backBtn,
            backIconStyle
          ]}
        />
      </Button>
    );
  }
}

BackButton.propTypes = {
  alt: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  testID: PropTypes.string,
  backIconStyle: PropTypes.object
};

const styles = StyleSheet.createProportional({
  container: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 10
  },
  shapeStyle: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  contentStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  backBtn: {
    fontSize: 24
  }
});
