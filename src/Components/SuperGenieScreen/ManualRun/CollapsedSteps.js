import React from "react";
import PropTypes from "prop-types";
import { View, StyleSheet } from "react-native";

import { Colors } from "../../../Themes";
import { Label } from "../../Shared";
import StepTag from "./StepTag";

export default function CollapsedSteps({
  currentProgramSteps
}) {
  let slicedArray = [];
  let moreLabel = "";
  if (currentProgramSteps.length > 4) {
    slicedArray = currentProgramSteps.slice(0, 4);
    moreLabel = `+${currentProgramSteps.length - 4}`;
  } else {
    slicedArray = currentProgramSteps;
  }
  return (
    <View style={styles.container}>
      {slicedArray.map((item) => (
        <StepTag
          key={item.index}
          modeId={item.mode}
          vacuum={item.vacuum}
          cycle={item.cycle}
        />
      ))}
      {moreLabel && (
        <View style={styles.moreItem}>
          <Label font12>{moreLabel}</Label>
        </View>
      )}
    </View>
  );
}

CollapsedSteps.propTypes = {
  currentProgramSteps: PropTypes.array,
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
  },
  moreItem: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.lightGrey200,
    alignItems: "center",
    justifyContent: "center",
  }
});
