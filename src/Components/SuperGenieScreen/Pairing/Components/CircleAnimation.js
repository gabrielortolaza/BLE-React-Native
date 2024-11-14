import React, { useState, useEffect } from "react";
import {
  View, Animated, Easing, StyleSheet
} from "react-native";
import PropTypes from "prop-types";

function CircleAnimation({
  initialValue, targetValue, duration, circleStyle
}) {
  const [circleRadius] = useState(new Animated.Value(initialValue));

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.sequence([
      Animated.timing(circleRadius, {
        toValue: targetValue,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(circleRadius, {
        toValue: initialValue,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start(() => {
      startAnimation();
    });
  };

  const animatedStyle = {
    width: circleRadius,
    height: circleRadius,
    borderRadius: circleRadius.interpolate({
      inputRange: [50, 150],
      outputRange: [25, 75],
    }),
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[circleStyle, animatedStyle]} />
    </View>
  );
}

CircleAnimation.propTypes = {
  initialValue: PropTypes.number,
  targetValue: PropTypes.number,
  duration: PropTypes.number,
  circleStyle: PropTypes.object,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CircleAnimation;
