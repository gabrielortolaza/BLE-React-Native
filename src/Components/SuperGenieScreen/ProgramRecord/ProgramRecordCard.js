import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";
import { Label } from "../../Shared";
import ProgramCardBody from "../../Shared/ProgramCard/ProgramCardBody";

const ProgramRecordCard = ({ index, programData, opacity }) => (
  <View style={[Styles.card, opacity && Styles.opacity]}>
    <Label center font30 weightSemiBold>{index}</Label>
    <ProgramCardBody
      pDuration={programData.duration}
      programData={programData}
      index={index}
      hideActions
    />
  </View>
);

ProgramRecordCard.propTypes = {
  index: PropTypes.number,
  programData: PropTypes.object,
  opacity: PropTypes.bool,
};

const Styles = {
  card: {
    backgroundColor: "white",
    width: 170,
    height: 170,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 15
  },
  opacity: {
    opacity: 0.5
  },
};

export default ProgramRecordCard;
