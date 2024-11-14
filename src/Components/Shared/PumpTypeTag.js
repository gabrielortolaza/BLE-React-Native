import React from "react";
import {
  StyleSheet, View
} from "react-native";
import PropTypes from "prop-types";
import { Label as Text } from ".";
import { Colors } from "../../Themes";
import { PUMP_TYPE } from "../../Config/constants";

/**
 * Pass the pumpTag as a string, names must be the same on DB
 */
const PumpTypeTag = ({ pumpTag = "" }) => {
  const getTextForModel = () => {
    if (pumpTag === PUMP_TYPE[1].key) {
      return PUMP_TYPE[1].name;
    }
    return PUMP_TYPE[0].name;
  };

  return (
    <View
      style={[
        styles.container, pumpTag === PUMP_TYPE[1].key ? styles.genieAdvanced : styles.superGenie
      ]}
    >
      <Text numberOfLines={1} maxFontSizeMultiplier={1} style={styles.text}>
        {getTextForModel()}
      </Text>
    </View>
  );
};

export default PumpTypeTag;

PumpTypeTag.propTypes = {
  pumpTag: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 140
  },
  superGenie: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 8,
  },
  genieAdvanced: {
    backgroundColor: Colors.lightPurple,
    borderRadius: 8,
  },
  text: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: "700",
    fontSize: 12
  }
});
