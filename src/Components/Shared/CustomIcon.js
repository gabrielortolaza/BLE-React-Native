import React from "react";
import { Image } from "react-native";
import PropTypes from "prop-types";
import StyleSheet from "../../Proportional";

export default function CustomIcon({ image, customStyles }) {
  const imageDimensions = Image.resolveAssetSource(image);

  const styles = StyleSheet.createProportional({
    iconImage: {
      width: imageDimensions.width,
      height: imageDimensions.height,
    },
  });

  return (
    <Image
      source={image}
      style={[styles.iconImage, customStyles]}
    />
  );
}

CustomIcon.propTypes = {
  image: PropTypes.number,
  customStyles: PropTypes.object,
};
