import React from "react";
import PropTypes from "prop-types";
import { Image } from "react-native";
import Button from "./Button";

export default class ImageButton extends React.PureComponent {
  render() {
    const {
      onPress,
      source,
      style,

      contentStyle,
      positionStyle,
      rippleColor,
      shapeStyle,
      elevation
    } = this.props;
    return (
      <Button
        onPress={onPress}
        contentStyle={contentStyle}
        positionStyle={positionStyle}
        rippleColor={rippleColor}
        shapeStyle={shapeStyle}
        elevation={elevation}
        transparent
      >
        <Image style={style} source={source} />
      </Button>
    );
  }
}

ImageButton.propTypes = {
  contentStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
  elevation: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  positionStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
  rippleColor: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
  shapeStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number]),
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.number])
};
