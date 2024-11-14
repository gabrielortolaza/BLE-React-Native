import React, { Component } from "react";
import {
  Animated, Easing, Image, StyleSheet, View
} from "react-native";
import PropTypes from "prop-types";
import { isIphoneX } from "react-native-iphone-screen-helper";

import { Colors, Images } from "../../../Themes";
import { Label } from "../../Shared";
import Container from "../../Shared/Container";
import { PUMP_DEVICE, WEARABLE_PAIR_NAME } from "../../../Config/constants";

export default class Connecting extends Component {
  constructor(props) {
    super(props);
    this.barPosition = new Animated.Value(0);
  }

  componentDidMount() {
    this.moveYellowBarUp();
  }

  moveYellowBarUp = () => {
    this.barPosition.setValue(0);
    Animated.timing(
      this.barPosition,
      {
        toValue: 1,
        duration: 700,
        useNativeDriver: false,
        easing: Easing.linear
      }
    ).start(() => this.moveYellowBarDown());
  };

  moveYellowBarDown = () => {
    this.barPosition.setValue(1);
    Animated.timing(
      this.barPosition,
      {
        toValue: 0,
        duration: 700,
        useNativeDriver: false,
        easing: Easing.linear
      }
    ).start(() => this.moveYellowBarUp());
  };

  render() {
    const { pumpName } = this.props;
    let source;
    if (!pumpName || pumpName === PUMP_DEVICE.SUPERGENIE) {
      source = Images.supergenieConnecting;
    } else if (pumpName === WEARABLE_PAIR_NAME) {
      source = Images.wearableTwoPair;
    } else {
      source = Images.wearablePair;
    }
    const movingMargin = this.barPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 83]
    });
    return (
      <Container noScroll style={Styles.container}>
        <View style={Styles.innerContainer}>
          <Image source={source} style={Styles.supergenieImg} />
          <View style={Styles.animationCont}>
            <View style={Styles.whiteBar}>
              <Animated.View
                style={[
                  Styles.animatedBar,
                  {
                    backgroundColor: Colors.blue,
                    marginTop: movingMargin
                  }
                ]}
              />
            </View>
            <Image source={Images.appIcon} style={Styles.appIcon} />
          </View>
          <Label
            maxFontSizeMultiplier={1.1}
            tertiaryDarker
            font20
            weightSemiBold
            center
            style={Styles.connectingText}
          >
            Connecting...
          </Label>
          <Label maxFontSizeMultiplier={1.1} tertiaryDarker font14 center paragraph>
            Connecting to your SuperGenie
          </Label>
        </View>
      </Container>
    );
  }
}

Connecting.propTypes = {
  pumpName: PropTypes.string,
};

const Styles = StyleSheet.create({
  container: {
    paddingTop: isIphoneX() ? 25 : 0,
    paddingBottom: 25,
    backgroundColor: Colors.tertiary,
  },
  innerContainer: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  supergenieImg: {
    marginTop: 100,
    marginBottom: 25
  },
  animationCont: {
    justifyContent: "space-around",
    alignItems: "center"
  },
  whiteBar: {
    backgroundColor: Colors.white,
    width: 6,
    height: 180,
    borderRadius: 100
  },
  animatedBar: {
    width: 6,
    height: 100,
    bottom: 0,
    borderRadius: 100
  },
  appIcon: {
    width: 80,
    height: 80,
    marginTop: 20
  },
  connectingText: {
    marginTop: 10
  }
});
