import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { View } from "react-native";

import Styles from "./Styles";

import FocusableLabel from "../Shared/FocusableLabel";

export default class RowVolumeNotes extends PureComponent {
  setInputVolumeRef = (ref) => {
    const { refInputVolume } = this.props;

    this.inputVolumeRef = ref;
    if (refInputVolume) {
      refInputVolume(ref);
    }
  };

  onFocusVolume = () => {
    const { focusRef, onFocus } = this.props;

    onFocus(focusRef);
  };

  onSubmitEditingVolume = (volumeValue) => {
    console.log("onSubmitEditingVolume", volumeValue);
    this.onChangeVolume(volumeValue);
  };

  onChangeVolume = (value) => {
    const { onChange, focus } = this.props;

    value = value === "" ? 0 : value;

    onChange(
      focus,
      value
    );
  };

  render() {
    const {
      focus, volume, measureUnit,
      hideVolume, focusRef, underline,
      labelStyle,
    } = this.props;

    return (
      <View style={Styles.column}>
        {!hideVolume && (
          <FocusableLabel
            testID="volume-input"
            ref={this.setInputVolumeRef}
            onChangeText={this.onChangeVolume}
            onSubmitEditing={this.onSubmitEditingVolume}
            onFocus={this.onFocusVolume}
            focus={focus === focusRef}
            underline={underline}
            value={volume === 0 ? "" : (typeof volume === "string" ? volume : `${volume}`)}
            staticText={measureUnit === "mililitre" ? "ml" : "oz"}
            keyboardType="numeric"
            returnKeyType="done"
            input
            style={[Styles.focusLabel, labelStyle]}
          />
        )}
      </View>
    );
  }
}

RowVolumeNotes.propTypes = {
  focus: PropTypes.string,
  measureUnit: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  refInputVolume: PropTypes.func,
  hideVolume: PropTypes.bool,
  volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  focusRef: PropTypes.string,
  underline: PropTypes.bool,
  labelStyle: PropTypes.object,
};
