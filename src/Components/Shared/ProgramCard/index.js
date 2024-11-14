import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { View, TouchableOpacity } from "react-native";

import Label from "../Label";
import { Colors } from "../../../Themes";
import ProgramCardBody from "./ProgramCardBody";
import ProgramCardEmpty from "./ProgramCardEmpty";
import Icon from "../Icon";

export default class ProgramCard extends PureComponent {
  render() {
    const {
      index, programData, opacity, hideActions,
      reorderStep, programLength, disableReordering,
    } = this.props;

    return (
      <View style={[Styles.card, opacity && Styles.opacity, hideActions && { height: 180 }]}>
        <View
          style={{ flexDirection: "row" }}
        >
          <Label
            font30
            weightBold
            blue
            maxFontSizeMultiplier={1}
          >
            {String(index + 1)}
          </Label>
          {
            programData.duration > 0 && !disableReordering && (
              <View
                style={Styles.arrowView}
              >
                {index > 0 && (
                  <TouchableOpacity
                    style={{ marginRight: 10 }}
                    onPress={() => reorderStep("left")}
                  >
                    <Icon
                      name="caret-back"
                      style={{ fontSize: 20, color: Colors.lightGrey2 }}
                    />
                  </TouchableOpacity>
                )}
                {!(index === (programLength - 2)) && (
                  <TouchableOpacity
                    style={{ marginRight: 10 }}
                    onPress={() => reorderStep("right")}
                  >
                    <Icon
                      name="caret-forward"
                      style={{ fontSize: 20, color: Colors.lightGrey2 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )
          }
        </View>
        {
          programData.duration > 0
            ? <ProgramCardBody {...this.props} index={index} />
            : <ProgramCardEmpty {...this.props} index={index} />
        }
      </View>
    );
  }
}

ProgramCard.propTypes = {
  programId: PropTypes.number,
  programData: PropTypes.object,
  index: PropTypes.number,
  opacity: PropTypes.bool,
  reorderStep: PropTypes.func,
  programLength: PropTypes.number,
  disableReordering: PropTypes.bool,
  hideActions: PropTypes.bool,
};

const Styles = {
  card: {
    backgroundColor: Colors.white,
    width: 170,
    height: 220,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    paddingHorizontal: 18,
    paddingVertical: 15
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4
  },
  opacity: {
    opacity: 0.5
  },
  arrowView: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%"
  }
};
