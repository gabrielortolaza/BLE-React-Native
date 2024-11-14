import React, { PureComponent } from "react";
import {
  View, TouchableOpacity, StyleSheet, Image
} from "react-native";
import PropTypes from "prop-types";
import Label from "./Label";

export default class SegmentInfo extends PureComponent {
  render() {
    const {
      data, active, activeColor,
      inactiveColor, inactiveBorderColor, onChange,
      transparent, containerStyle, style,
      contrastMode = true, textStyle, getContMeasurements
    } = this.props;

    return (
      <View
        style={[styles.container, containerStyle]}
        onLayout={(event) => {
          if (getContMeasurements) {
            event.target.measure(
              (fx, fy, width, height, pageX, pageY) => {
                getContMeasurements({
                  x: fx + pageX,
                  y: fy + pageY,
                  width,
                  height
                });
              },
            );
          }
        }}
      >
        {data.map((x, index) => (
          <TouchableOpacity
            style={
              [
                styles.info,
                { backgroundColor: active === x.key ? activeColor : (transparent ? "transparent" : inactiveColor) },
                {
                  borderColor: contrastMode
                    ? activeColor
                    : active === x.key ? activeColor : inactiveBorderColor
                },
                index === 0 && styles.leftSegment,
                index === (data.length - 1) && styles.rightSegement,
                style
              ]
            }
            onPress={() => { onChange(x.key, index); }}
            key={x.key}
          >
            {Array.isArray(x.images) && (
              <Image
                source={active === x.key ? x.images[0] : x.images[1]}
                style={{
                  width: 30,
                  height: 30,
                  marginRight: 3
                }}
              />
            )}
            <Label
              font14
              weightBold
              maxFontSizeMultiplier={1}
              style={[
                {
                  color: active === x.key
                    ? (contrastMode ? inactiveColor : activeColor)
                    : (contrastMode ? activeColor : inactiveColor),
                  alignSelf: "center"
                },
                textStyle
              ]}
            >
              {x.name}
            </Label>
          </TouchableOpacity>
        ))}
      </View>
    );
  }
}

SegmentInfo.propTypes = {
  data: PropTypes.array.isRequired,
  active: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  activeColor: PropTypes.string.isRequired,
  inactiveColor: PropTypes.string.isRequired,
  inactiveBorderColor: PropTypes.string,
  onChange: PropTypes.func,
  transparent: PropTypes.bool,
  containerStyle: PropTypes.object,
  style: PropTypes.object,
  textStyle: PropTypes.object,
  contrastMode: PropTypes.bool,
  getContMeasurements: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 10,
    alignSelf: "center"
  },
  info: {
    flexDirection: "row",
    height: 25,
    width: 80,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  leftSegment: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8
  },
  rightSegement: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  }
});
