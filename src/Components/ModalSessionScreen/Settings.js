/** Page appears to no longer be used */
/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  Dimensions,
  ImageBackground,
  ScrollView
} from "react-native";

import StyleSheet from "../../Proportional";
import { Fonts } from "../../Themes"; // Styles, Colors,
import { CloseModal, Welcome } from "../Shared";

import Pumping from "../../Assets/Images/sessionPump160.png";
import Feeding from "../../Assets/Images/sessionFeed160.png";

const Touchable =
  Platform.OS === "ios" ? TouchableWithoutFeedback : TouchableNativeFeedback;
const useForeground =
  Platform.OS === "android" && TouchableNativeFeedback.canUseNativeForeground();

export default class SessionSettings extends Component {
  constructor(props) {
    super(props);
    const sessionType = props.sessionType || "none";

    this.state = {
      sessionType,
      pumpAnimation: new Animated.Value(sessionType === "pump" ? 1 : 0),
      feedAnimation: new Animated.Value(sessionType === "feed" ? 1 : 0)
    };
  }

  togglePump = () => {
    if (this.state.sessionType === "pump") {
      this.start();
    } else {
      Animated.timing(this.state.pumpAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false
      }).start();
      if (this.state.sessionType === "feed") {
        Animated.timing(this.state.feedAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false
        }).start();
      }
      this.setState({ sessionType: "pump" });
    }
  };

  toggleFeed = () => {
    if (this.state.sessionType === "feed") {
      this.start();
    } else {
      Animated.timing(this.state.feedAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false
      }).start();
      if (this.state.sessionType === "pump") {
        Animated.timing(this.state.pumpAnimation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false
        }).start();
      }
      this.setState({ sessionType: "feed" });
    }
  };

  start = () => {
    this.props.sessionStart(this.props.actionType, this.state.sessionType);
  };

  render() {
    const halfBoxWidth = Dimensions.get("screen").width / 2 - 48;
    const { sessionType } = this.state;
    const { actionType } = this.props;
    const isManual = actionType === "manual";
    const isSessionTypePicked =
      sessionType === "pump" || sessionType === "feed";
    return (
      <View style={styles.container}>
        <CloseModal onPress={this.props.back} />
        <ScrollView style={styles.container}>
          <Welcome
            title={isManual ? "Manual" : "Record"}
            subtitle="Select feeding type"
          />
          <View style={styles.actions}>
            <Touchable
              useForeground={useForeground}
              onPress={() => this.togglePump()}
            >
              <Animated.View
                style={[
                  styles.actionButton,
                  {
                    left: this.state.pumpAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [halfBoxWidth + 5, halfBoxWidth - 15]
                    }),
                    height: this.state.pumpAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [188, 232]
                    }),
                    width: this.state.pumpAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [130, 160]
                    }),
                    opacity: this.state.pumpAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1]
                    }),
                    shadowOpacity: this.state.pumpAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1]
                    }),
                    top: this.state.pumpAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [22, 0]
                    }),
                    zIndex: this.state.pumpAnimation
                  }
                ]}
              >
                <ImageBackground
                  source={Pumping}
                  resizeMode="cover"
                  style={StyleSheet.absoluteFill}
                />
                <Animated.Text
                  style={[
                    styles.actionLabel,
                    {
                      fontSize: this.state.pumpAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 30]
                      }),
                      marginTop: this.state.pumpAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [14, 22]
                      }),
                      opacity: this.state.pumpAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1]
                      })
                    }
                  ]}
                >
                  Pump
                </Animated.Text>
              </Animated.View>
            </Touchable>
            <Touchable
              useForeground={useForeground}
              onPress={() => this.toggleFeed()}
            >
              <Animated.View
                style={[
                  styles.actionButton,
                  {
                    right: this.state.feedAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [halfBoxWidth + 5, halfBoxWidth - 15]
                    }),
                    height: this.state.feedAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [188, 232]
                    }),
                    width: this.state.feedAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [130, 160]
                    }),
                    opacity: this.state.feedAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1]
                    }),
                    shadowOpacity: this.state.feedAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 1]
                    }),
                    top: this.state.feedAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [22, 0]
                    }),
                    zIndex: this.state.feedAnimation
                  }
                ]}
              >
                <ImageBackground
                  source={Feeding}
                  resizeMode="cover"
                  style={StyleSheet.absoluteFill}
                />
                <Animated.Text
                  style={[
                    styles.actionLabel,
                    {
                      fontSize: this.state.feedAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 30]
                      }),
                      marginTop: this.state.feedAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [14, 22]
                      }),
                      opacity: this.state.feedAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1]
                      })
                    }
                  ]}
                >
                  Feed
                </Animated.Text>
              </Animated.View>
            </Touchable>
          </View>
        </ScrollView>
      </View>
    );
  }
}

SessionSettings.propTypes = {
  sessionType: PropTypes.string,
  actionType: PropTypes.string,
  back: PropTypes.func.isRequired,
  sessionStart: PropTypes.func.isRequired
};

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  actions: {
    height: 250,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 48
  },
  actionLabel: {
    ...Fonts.Regular,
    textAlign: "center",
    backgroundColor: "transparent",
    fontSize: 20,
    color: "rgb(71, 71, 71)"
  },
  actionButton: {
    position: "absolute",
    backgroundColor: "#c4f2ec",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: {
      width: 0,
      height: 30
    },
    shadowRadius: 60
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  start: {
    justifyContent: "flex-end",
    flexDirection: "row",
    marginVertical: 30,
    marginHorizontal: 48
  }
});
