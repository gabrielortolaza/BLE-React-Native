import React from "react";
import { View, Platform } from "react-native";
import PropTypes from "prop-types";
import { SafeAreaView } from "react-native-safe-area-context";

import StyleSheet from "../../Proportional";
import { Colors } from "../../Themes";
import BackButton from "./BackButton";

const ModalWrapper = ({
  back, children, backIconStyle, bottomBorder
}) => (
  <SafeAreaView style={styles.container}>
    <View
      style={[
        Platform.OS === "ios" && styles.closeWrapper,
        bottomBorder && styles.bottomBorder
      ]}
    >
      <BackButton
        onPress={back}
        backIconStyle={backIconStyle}
      />
    </View>
    {children}
  </SafeAreaView>
);

export default ModalWrapper;

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    backgroundColor: Colors.white
  },
  closeWrapper: {
    zIndex: 10
  },
  bottomBorder: {
    borderBottomColor: Colors.lightGrey300,
    borderBottomWidth: 1,
    height: 65
  }
});

ModalWrapper.propTypes = {
  back: PropTypes.func,
  bottomBorder: PropTypes.bool,
  backIconStyle: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
};
