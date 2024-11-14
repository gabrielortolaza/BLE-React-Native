import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { TouchableOpacity, View } from "react-native";

import Label from "../Label";
import { Colors } from "../../../Themes";
import { LETDOWN } from "../../../Config/Modes";
import Icon from "../Icon";

export default class ProgramCardBody extends PureComponent {
  render() {
    const {
      programData, hideActions, editStep,
      deleteStep, pDuration, index
    } = this.props;
    const {
      duration, mode, vacuum, cycle, pause
    } = programData;
    const realDuration = pDuration || duration;

    return (
      <View>
        <Label maxFontSizeMultiplier={1} grey font14 weightBold>{mode ? (mode === LETDOWN ? "Letdown" : "Expression") : "Pause"}</Label>
        <View style={Styles.cardRow}>
          <Label maxFontSizeMultiplier={1} grey font14>Duration </Label>
          <Label maxFontSizeMultiplier={1} font14 dark weightBold>{`${(`00${Math.floor(realDuration / 60)}`).slice(-2)}:${(`00${Math.floor(realDuration % 60)}`).slice(-2)}`}</Label>
        </View>
        { !pause && (
          <View>
            <View style={Styles.cardRow}>
              <Label maxFontSizeMultiplier={1} grey font14>Vacuum</Label>
              <Label maxFontSizeMultiplier={1} font14 dark weightBold>{vacuum}</Label>
            </View>
            <View style={Styles.cardRow}>
              <Label maxFontSizeMultiplier={1} grey font14>Cycle</Label>
              <Label maxFontSizeMultiplier={1} font14 dark weightBold>{cycle}</Label>
            </View>
          </View>
        )}
        { !hideActions
          && (
            <View style={[Styles.cardRow, Styles.cardButtons]}>
              {editStep && (
                <TouchableOpacity
                  testID={`edit_program_step${index}`}
                  onPress={editStep}
                >
                  <Icon type="FontAwesome" name="pencil" fontSize="user-defined" style={Styles.buttonIcon} />
                </TouchableOpacity>
              )}
              {deleteStep && (
                <TouchableOpacity onPress={deleteStep}>
                  <Icon type="FontAwesome" name="trash" fontSize="user-defined" style={Styles.buttonIcon2} />
                </TouchableOpacity>
              )}
            </View>
          )}
      </View>
    );
  }
}

ProgramCardBody.propTypes = {
  programData: PropTypes.object,
  editStep: PropTypes.func,
  deleteStep: PropTypes.func,
  hideActions: PropTypes.bool,
  pDuration: PropTypes.number,
  index: PropTypes.number
};

const Styles = {
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4
  },
  cardButtons: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGrey2,
    marginTop: 10,
    paddingTop: 8
  },
  buttonIcon: {
    color: Colors.blue,
    fontSize: 18
  },
  buttonIcon2: {
    color: Colors.red,
    fontSize: 18
  }
};
