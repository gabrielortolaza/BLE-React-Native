import React from "react";
import { StyleSheet, View } from "react-native";
import PropTypes from "prop-types";

import { Colors } from "../../Themes";
import Label from "./Label";

const RequiredLabel = ({ text }) => {
  return (
    <View style={styles.requiredTagConteiner}>
      <Label font16>{text}</Label>
      <View style={styles.requiredTagView}>
        <Label style={styles.requiredTagText}>required</Label>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  requiredTagConteiner: {
    flexDirection: "row",
    marginVertical: 16,
  },
  requiredTagText: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontWeight: "700",
  },
  requiredTagView: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 8,
    marginLeft: 5,
  },
});

RequiredLabel.propTypes = {
  text: PropTypes.string.isRequired,
};

export default RequiredLabel;
