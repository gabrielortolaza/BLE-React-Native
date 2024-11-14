import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { Colors } from "../../Themes";

export default (props) => {
  // eslint-disable-next-line react/prop-types
  const { isLoading } = props;
  return (
    isLoading && (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.5)"
  },
});
