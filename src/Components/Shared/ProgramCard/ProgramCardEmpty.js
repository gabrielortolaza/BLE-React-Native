import React, { PureComponent } from "react";
import { TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import Label from "../Label";
import { Colors } from "../../../Themes";
import Icon from "../Icon";

export default class ProgramCardEmpty extends PureComponent {
  render() {
    const { editStep } = this.props;
    return (
      <TouchableOpacity onPress={editStep} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Icon name="add" style={{ color: Colors.blue, fontSize: 40 }} />
        <Label center font14 weightSemiBold blue>Add a step</Label>
      </TouchableOpacity>
    );
  }
}

ProgramCardEmpty.propTypes = {
  editStep: PropTypes.func,
};
