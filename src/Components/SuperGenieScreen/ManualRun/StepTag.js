import React from "react";
import PropTypes from "prop-types";
import {
  View, StyleSheet, Image,
} from "react-native";

import { Colors, Images } from "../../../Themes";
import { EXPRESSION } from "../../../Config/Modes";
import { Label } from "../../Shared";

export default function StepTag({
  modeId, vacuum, cycle
}) {
  let label = "";
  if (vacuum) {
    label = `V${vacuum}`;
  }
  if (cycle) {
    label += `C${cycle}`;
  }
  return (
    <View style={styles.container}>
      <Image
        source={modeId === EXPRESSION ? Images.expressionBlue : Images.letdownBlue}
        style={styles.modeImage}
      />
      <Label font12>{label}</Label>
    </View>
  );
}

StepTag.propTypes = {
  modeId: PropTypes.number,
  vacuum: PropTypes.number,
  cycle: PropTypes.number,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.backgroundBlue,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    padding: 4,
    marginRight: 8,
  },
  modeImage: {
    width: 14,
    height: 14,
    resizeMode: "contain",
    marginRight: 4,
  },
});
