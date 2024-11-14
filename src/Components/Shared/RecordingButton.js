import React from "react";
import {
  View, Text, StyleSheet, Platform
} from "react-native";
import PropTypes from "prop-types";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "./Button";

export default class RecordingButton extends React.PureComponent {
  render() {
    const { isVisible, onPress } = this.props;
    if (!isVisible) return null;

    return (
      <View style={styles.container}>
        <SafeAreaView forceInset={{ top: "always" }}>
          <Button
            positionStyle={styles.buttonPosition}
            shapeStyle={styles.buttonShape}
            contentStyle={styles.buttonContent}
            onPress={onPress}
          >
            <Text style={styles.text}>Recording</Text>
            <View style={styles.dot} />
          </Button>
        </SafeAreaView>
      </View>
    );
  }
}

RecordingButton.propTypes = {
  isVisible: PropTypes.bool,
  onPress: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    zIndex: 999,
    position: "absolute",
    right: 20
  },
  buttonPosition: {
    marginTop: Platform.OS === "ios " ? 10 : 17
    // top: 17, // 55
  },
  buttonShape: {
    borderRadius: 15,
    //    borderWidth: 1,
    //    borderColor: "rgb(139,0,0)"
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(255,0,0,0.1)"
  },
  text: {
    color: "red",
    fontSize: 10
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: "red",
    borderRadius: 8,
    marginLeft: 5
  }
});
