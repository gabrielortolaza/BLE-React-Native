/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import { View, PanResponder } from "react-native";
import PropTypes from "prop-types";

export default class SwipeGesture extends Component {
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount = () => {
    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { onSwipePerformed } = this.props;
        const x = gestureState.dx;
        const y = gestureState.dy;

        if (Math.abs(x) > Math.abs(y)) {
          if (x >= 0) {
            onSwipePerformed("right");
          } else {
            onSwipePerformed("left");
          }
        } else if (y >= 0) {
          onSwipePerformed("down");
        } else {
          onSwipePerformed("up");
        }
      }
    });
  }

  render() {
    const { children, gestureStyle } = this.props;

    return (
      <View {...this.PanResponder.panHandlers} style={gestureStyle}>
        <View>{children}</View>
      </View>
    );
  }
}

SwipeGesture.propTypes = {
  children: PropTypes.any,
  gestureStyle: PropTypes.object,
  onSwipePerformed: PropTypes.func
};
