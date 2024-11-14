import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import PropTypes from "prop-types";

import Icon from "../../../Shared/Icon";
import { Colors } from "../../../../Themes";

const PendulumAnimation = ({ duration }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(animatedValue, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }).start(() => {
          startAnimation();
        });
      });
    };

    startAnimation();
  }, [animatedValue]);

  const rotateInterpolate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["-20deg", "20deg"],
  });

  const animatedStyle = {
    transform: [{ rotate: rotateInterpolate }],
  };

  return (
    <Animated.View style={[styles.pendulum, animatedStyle]}>
      <Icon type="MaterialIcons" name="question-mark" style={styles.icon} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pendulum: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginTop: -8,
    color: Colors.white,
    fontSize: 44,
  },
});

PendulumAnimation.propTypes = {
  duration: PropTypes.number,
};

export default PendulumAnimation;
