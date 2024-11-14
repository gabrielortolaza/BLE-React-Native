import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text } from "react-native";

import StyleSheet from "../../Proportional";
import { Fonts } from "../../Themes";
import { RoundButton, ConfirmationToast } from "../Shared";
import * as M from "../../Config/messages";

import RowDateTime from "../ModalSessionScreen/RowDateTime";
import RowVolumeNotes from "../ModalSessionScreen/RowVolumeNotes";

export default class Editing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focus: "",
      error: false,
      shouldConfirm: false,
    };
  }

  onSave = () => {
    const { sessionSave, closeModal } = this.props;
    sessionSave()
      .then(closeModal)
      .catch((x) => this.setState({ error: x }));
  };

  onConfirmSave = () => {
    const { volume, sessionType } = this.props;
    if (sessionType === "pump") {
      if (volume === 0 || volume === null) {
        this.setState({ shouldConfirm: true });
      } else {
        this.onSave();
      }
    } else {
      this.onSave();
    }
  };

  onConfirmDeny = () => {
    this.setState({ shouldConfirm: false });
  };

  render() {
    const {
      onChange,
      startedAt,
      finishedAt,
      volume,
      sessionType,
      notes,
      closeModal,
      measureUnit,
    } = this.props;
    const { focus, shouldConfirm, error } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.popup}>
          <Text style={styles.title}>Edit Session</Text>

          <RowDateTime
            finishedAt={finishedAt || Date.now()}
            focus={focus}
            onChange={onChange}
            onFocus={(focusId) => this.setState({ focus: focus === focusId ? "" : focusId })}
            startedAt={startedAt}
          />

          <RowVolumeNotes
            focus={focus}
            hideVolume={sessionType === "feed"}
            measureUnit={measureUnit}
            notes={notes}
            onChange={onChange}
            onFocus={(focusId) => this.setState({ focus: focus === focusId ? "" : focusId })}
            volume={volume}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.buttons}>
            <RoundButton white small onPress={closeModal}>
              Cancel
            </RoundButton>
            <RoundButton small onPress={this.onConfirmSave}>
              Save
            </RoundButton>
          </View>

          {shouldConfirm && (
            <ConfirmationToast
              title={M.NO_AMOUNT}
              subtitle={M.CONTINUE_NO_AMOUNT}
              onPressConfirm={this.onSave}
              onPressDeny={this.onConfirmDeny}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "rgba(212, 236, 246, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    paddingVertical: 30,
    paddingHorizontal: 25,
    backgroundColor: "white",
    borderRadius: 4,
  },
  title: {
    marginBottom: 25,
    textAlign: "center",
    ...Fonts.SemiBold,
    fontSize: 14,
  },
  error: {
    marginTop: 10,
    textAlign: "center",
    ...Fonts.SemiBold,
    fontSize: 12,
    color: "red",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 25,
    justifyContent: "space-between",
  },
});

Editing.propTypes = {
  sessionSave: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,

  startedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  finishedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  notes: PropTypes.string,
  sessionType: PropTypes.string,
  measureUnit: PropTypes.string,
};
