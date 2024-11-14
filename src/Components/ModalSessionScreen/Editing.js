import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View, Text, Platform, TouchableOpacity,
  Switch
} from "react-native";
import firebase from "@react-native-firebase/app";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import RNPickerSelect from "react-native-picker-select";

import StyleSheet from "../../Proportional";
import {
  Fonts, Colors, Styles
} from "../../Themes";
import {
  ButtonRound, ConfirmationToast, Label,
  SegmentInfo,
} from "../Shared";
import MultilineInput from "../Shared/MultilineInput";
import { fluidFrom, fluidTo } from "../../Services/Convert";
import * as C from "../../Config/constants";
import * as M from "../../Config/messages";
import SessionHeader from "./SessionHeader";
import RowDateTime from "./RowDateTime";
import RowVolumeNotes from "./RowVolumeNotes";
import Icon from "../Shared/Icon";
import { appWidth } from "../../Services/SharedFunctions";
import {
  DELETE_SESSION, FEED_SESSION, MANUAL_SESSION,
  PUMP_SESSION, STASH_SESSION, ADD_STASH, REMOVE_STASH
} from "../../Config/Analytics";

export default class Editing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focus: "",
      error: false,
      shouldConfirm: false,
      showEditConfirm: false,
      deletingEntry: false,
      stashEnabled: false,
      stashVolume: 0,
      selectedProgram: false,
      originalData: {},
    };
  }

  componentDidMount() {
    const {
      volume, measureUnit, volumeBreastSide,
      startedAt, finishedAt, breastType,
      programName, notes
    } = this.props;

    const volumeConverted = fluidTo({
      measureUnit,
      value: volume || 0
    });

    let volumeLeftConverted = 0;
    let volumeRightConverted = 0;

    if (breastType === C.BREAST_TYPE.left) {
      volumeLeftConverted = volumeConverted;
    } else if (breastType === C.BREAST_TYPE.right) {
      volumeRightConverted = volumeConverted;
    }

    const volumeBreastSideRightConverted = fluidTo({
      measureUnit,
      value: volumeBreastSide.right || 0
    });

    const volumeBreastSideLeftConverted = fluidTo({
      measureUnit,
      value: volumeBreastSide.left || 0
    });

    this.setState({
      volumeLeft: `${volumeLeftConverted}`,
      volumeRight: `${volumeRightConverted}`,
      volumeBreastSideRight: `${volumeBreastSideRightConverted}`,
      volumeBreastSideLeft: `${volumeBreastSideLeftConverted}`,
      oldStartedAt: startedAt,
      oldFinishedAt: finishedAt
    });

    this.setState({
      programSelectVal: C.NO_PROGRAM_VALUE,
      programSelectName: programName || "No program"
    });

    this.setState({
      originalData: {
        startedAt,
        volumeLeft: `${volumeLeftConverted}`,
        volumeRight: `${volumeRightConverted}`,
        volumeBreastSideRight: `${volumeBreastSideRightConverted}`,
        volumeBreastSideLeft: `${volumeBreastSideLeftConverted}`,
        programSelectVal: C.NO_PROGRAM_VALUE,
        notes,
      }
    });
  }

  componentDidUpdate(prevProps) {
    const {
      volume, measureUnit, volumeBreastSide,
      breastType
    } = this.props;

    if (prevProps.volume !== volume) {
      const volumeConverted = fluidTo({
        measureUnit,
        value: volume || 0
      });

      if (breastType === C.BREAST_TYPE.left) {
        this.setState({ volumeLeft: volumeConverted });
      } else if (breastType === C.BREAST_TYPE.right) {
        this.setState({ volumeRight: volumeConverted });
      }
    }

    if (prevProps.volumeBreastSide.right !== volumeBreastSide.right) {
      const volumeBreastSideRightConverted = fluidTo({
        measureUnit,
        value: volumeBreastSide.right || 0
      });

      this.setState({
        volumeBreastSideRight: volumeBreastSideRightConverted
      });
    }

    if (prevProps.volumeBreastSide.left !== volumeBreastSide.left) {
      const volumeBreastSideLeftConverted = fluidTo({
        measureUnit,
        value: volumeBreastSide.left || 0
      });

      this.setState({
        volumeBreastSideLeft: volumeBreastSideLeftConverted
      });
    }
  }

  durationChanged = () => {
    const { startedAt, finishedAt } = this.props;
    const { oldStartedAt, oldFinishedAt } = this.state;

    if (oldStartedAt !== startedAt || oldFinishedAt !== finishedAt) {
      return true;
    }

    return false;
  };

  getSideVolume = () => {
    const { breastType } = this.props;
    const { volumeLeft, volumeRight } = this.state;

    let volume = 0;

    if (breastType === C.BREAST_TYPE.left) {
      volume = volumeLeft;
    } else if (breastType === C.BREAST_TYPE.right) {
      volume = volumeRight;
    }

    return volume;
  };

  onSave = () => {
    const {
      sessionSave, closeModal, validateSession,
      status, duration, actionType,
      keey, startedAt, finishedAt,
      sessionType, notes, breastType,
      measureUnit, newSession, createdAt,
      programId, removeSession
    } = this.props;
    const { volumeBreastSideLeft, volumeBreastSideRight, programSelectVal } = this.state;

    const { uid } = firebase.auth().currentUser;

    const convertedVolume = sessionType === "feed" ? 0 : fluidFrom(
      {
        measureUnit,
        value: this.getSideVolume()
      }
    );

    const volumeBreastSideLeftConverted = sessionType === "feed" ? 0 : fluidFrom(
      {
        measureUnit,
        value: volumeBreastSideLeft
      }
    );

    const volumeBreastSideRightConverted = sessionType === "feed" ? 0 : fluidFrom(
      {
        measureUnit,
        value: volumeBreastSideRight
      }
    );

    const data = {
      status,
      duration: (!newSession && this.durationChanged()) ? 0 : duration,
      actionType,
      key: keey,
      startedAt,
      finishedAt,
      sessionType,
      notes,
      volume: convertedVolume,
      breastType,
      uid,
      volumeBreastSideLeft: volumeBreastSideLeftConverted,
      volumeBreastSideRight: volumeBreastSideRightConverted,
      sessionKind: C.SESSION_KIND_MANUAL,
      createdAt,
      programId: newSession
        ? (programSelectVal === C.NO_PROGRAM_VALUE ? null : programSelectVal)
        : programId
    };

    validateSession(data)
      .then((x) => {
        if (keey !== x.key) {
          // Swapped pump and feed sessionType
          // Remove old key session first
          removeSession(keey);
        }

        sessionSave(uid, x);
        const logName = sessionType === "feed" ? FEED_SESSION : PUMP_SESSION;
        firebase.analytics().logEvent(logName, {
          type: MANUAL_SESSION,
          newSession
        });
        closeModal();
      })
      .catch((x) => this.setState({ error: x }));
  };

  onConfirmSave = () => {
    const {
      sessionType, breastType, measureUnit,
      saveStash, notes
    } = this.props;
    const {
      volumeBreastSideLeft, volumeBreastSideRight, stashEnabled, stashVolume
    } = this.state;

    const volume = this.getSideVolume();

    if (stashEnabled) {
      const volumeConverted = fluidFrom({
        measureUnit,
        value: stashVolume,
      });

      const stashData = {
        key: `${Date.now()}_stash`,
        type: "stash",
        volume: volumeConverted,
        notes,
        startedAt: Date.now(),
        sessionType: sessionType === "pump" ? C.SESSION_TYPE_ADDED : C.SESSION_TYPE_REMOVED
      };

      const { uid } = firebase.auth().currentUser;
      saveStash(uid, stashData);
      firebase.analytics().logEvent(STASH_SESSION, {
        type: sessionType === "pump" ? ADD_STASH : REMOVE_STASH,
        newSession: true
      });
    }

    if (sessionType === "pump") {
      if (
        ((breastType !== C.BREAST_TYPE.both) && (volume === 0 || volume === null))
        || ((breastType === C.BREAST_TYPE.both)
          && (volumeBreastSideLeft + volumeBreastSideRight === 0))
      ) {
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

  deleteSession = () => {
    const {
      keey, removeSession, logsMap,
      closeModal
    } = this.props;

    if (keey) removeSession(keey, logsMap);
    firebase.analytics().logEvent(DELETE_SESSION);
    closeModal();
  };

  volumeChange = (focus, value) => {
    const { breastType } = this.props;

    if (focus === "volume") {
      if (breastType === C.BREAST_TYPE.left) {
        this.setState({
          volumeLeft: value,
          stashVolume: value
        });
      } else if (breastType === C.BREAST_TYPE.right) {
        this.setState({
          volumeRight: value,
          stashVolume: value
        });
      }
    }

    if (focus === "volumeBreastSideLeft") {
      this.setState({
        volumeBreastSideLeft: value,
        stashVolume: value
      });
    }

    if (focus === "volumeBreastSideRight") {
      this.setState({
        volumeBreastSideRight: value,
        stashVolume: value
      });
    }

    if (focus === "stashVolume") {
      this.setState({ stashVolume: value });
    }
  };

  segmentChange = (x) => {
    const { onChange } = this.props;

    onChange("breastType", x);
  };

  goBack = () => {
    const {
      closeModal, notes, startedAt, finishedAt
    } = this.props;
    const {
      programSelectVal, volumeLeft, volumeRight,
      volumeBreastSideLeft, volumeBreastSideRight,
      oldStartedAt, oldFinishedAt, originalData
    } = this.state;
    const newData = {
      startedAt,
      volumeLeft,
      volumeRight,
      volumeBreastSideRight,
      volumeBreastSideLeft,
      programSelectVal,
      notes,
    };
    const oldDuration = ((oldFinishedAt - oldStartedAt) / 60000).toFixed(2);
    const duration = ((finishedAt - startedAt) / 60000).toFixed(2);

    if (JSON.stringify(newData) !== JSON.stringify(originalData)
      || oldDuration !== duration) {
      this.setState({ showEditConfirm: true });
    } else {
      closeModal();
    }
  };

  render() {
    const {
      onChange, startedAt, finishedAt,
      newSession, sessionType, notes,
      closeModal, measureUnit, breastType,
      editAutoPumpSession, programsSelect
    } = this.props;
    const {
      focus, shouldConfirm, error,
      deletingEntry, volumeLeft, volumeRight,
      volumeBreastSideLeft, volumeBreastSideRight,
      stashEnabled, stashVolume, programSelectVal,
      programSelectName, selectedProgram, showEditConfirm
    } = this.state;

    const breastTypeArr = [
      { name: "Left", key: C.BREAST_TYPE.left },
      { name: "Right", key: C.BREAST_TYPE.right },
      { name: "Both", key: C.BREAST_TYPE.both }
    ];

    const usedContainerStyle = [
      styles.container,
      newSession && { paddingTop: 20 }
    ];

    return (
      <View style={{ flex: 1, paddingTop: 15 }}>
        {newSession && (
          <SessionHeader
            sessionType={sessionType}
            onChange={onChange}
          />
        )}
        <KeyboardAwareScrollView style={usedContainerStyle}>
          <Label font12 weightBold mb10>
            START TIME
          </Label>

          <RowDateTime
            finishedAt={finishedAt || Date.now()}
            focus={focus}
            onChange={onChange}
            onFocus={(focusId) => this.setState({ focus: focus === focusId ? "" : focusId })}
            startedAt={startedAt}
          />

          <Label font12 weightBold mt10>
            {sessionType === "feed" ? "SIDE" : "AMOUNT"}
          </Label>

          <SegmentInfo
            data={breastTypeArr}
            onChange={this.segmentChange}
            active={breastType}
            activeColor={Colors.blue}
            inactiveColor={Colors.white}
            containerStyle={styles.breastTypeStyle}
            style={{ width: "33%", height: 36 }}
          />

          {((breastType === C.BREAST_TYPE.left || breastType === C.BREAST_TYPE.right) && sessionType !== "feed") ? (
            <RowVolumeNotes
              focus={focus}
              focusRef="volume"
              underline
              hideVolume={sessionType === "feed"}
              measureUnit={measureUnit}
              onChange={this.volumeChange}
              onFocus={(focusId) => this.setState({ focus: focus === focusId ? "" : focusId })}
              volume={breastType === C.BREAST_TYPE.left ? volumeLeft : volumeRight}
              labelStyle={Styles.fullWidth}
            />
          ) : (
            sessionType !== "feed" && (
              <View style={styles.volumeView}>
                <View style={styles.leftVolume}>
                  <Label style={styles.volumeText}>Left</Label>
                  <RowVolumeNotes
                    focus={focus}
                    focusRef="volumeBreastSideLeft"
                    underline
                    measureUnit={measureUnit}
                    onChange={this.volumeChange}
                    onFocus={(focusId) => this.setState({ focus: focus === focusId ? "" : focusId })}
                    volume={volumeBreastSideLeft}
                    labelStyle={{ width: appWidth / 3.3 }}
                  />
                </View>
                <View style={styles.rightVolume}>
                  <Label style={styles.volumeText}>Right</Label>
                  <RowVolumeNotes
                    focus={focus}
                    focusRef="volumeBreastSideRight"
                    underline
                    measureUnit={measureUnit}
                    onChange={this.volumeChange}
                    onFocus={(focusId) => this.setState({ focus: focus === focusId ? "" : focusId })}
                    volume={volumeBreastSideRight}
                    labelStyle={{ width: appWidth / 3.3 }}
                  />
                </View>
              </View>
            )
          )}
          {sessionType === "pump" && (
            <View style={styles.programView}>
              <Label font12 weightBold>
                PROGRAM
              </Label>
              <RNPickerSelect
                placeholder={{}}
                value={programSelectVal}
                disabled={!newSession}
                onValueChange={(value, index) => {
                  if (!newSession) {
                    return;
                  }

                  this.setState({
                    programSelectVal: value,
                    programSelectName: programsSelect[index].label,
                    selectedProgram: !(value === C.NO_PROGRAM_VALUE)
                  });
                }}
                items={programsSelect}
                fixAndroidTouchableBug
              >
                <View
                  style={[
                    styles.programSelectView,
                    newSession && styles.programSelectViewNewSess
                  ]}
                >
                  <Label
                    style={[
                      styles.programLabel,
                      selectedProgram && styles.selectedProgram
                    ]}
                    numberOfLines={1}
                    font14
                    tertiary
                  >
                    {programSelectName}
                  </Label>
                  {newSession && (
                    <Icon style={styles.downArrow} name="down" type="AntDesign" />
                  )}
                </View>
              </RNPickerSelect>
            </View>
          )}
          <View style={styles.noteView}>
            <Label font12 weightBold>
              NOTES
            </Label>

            <MultilineInput
              testID="notes-input"
              onChangeText={(value) => onChange("notes", value)}
              returnKeyType="next"
              value={notes}
              style={styles.note}
              placeholder="Add your notes"
              error={notes?.length > 500 ? "Maximum notes 500 characters" : ""}
            />
          </View>
          {error && (
            <Text style={styles.error}>{error}</Text>
          )}
          {!newSession && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => this.setState({ deletingEntry: !deletingEntry })}
            >
              <Icon type="MaterialIcons" name="delete" style={styles.deleteIcon} />
              <Label font14 style={styles.deleteLabel}>
                Delete
              </Label>
            </TouchableOpacity>
          )}
          {(newSession || editAutoPumpSession) && (
            <View style={styles.stashArea}>
              <View style={styles.stashSwitch}>
                <Label font12 weightSemiBold>
                  {`${sessionType === "pump" ? "ADD TO" : "REMOVE FROM"} STASH`}
                </Label>
                <Switch
                  trackColor={{ true: Colors.windowsBlue, false: Colors.lightGrey300 }}
                  thumbColor={Platform.OS === "android" ? Colors.backgroundThree : null}
                  onValueChange={() => this.setState({ stashEnabled: !stashEnabled })}
                  value={stashEnabled}
                />
              </View>
              {stashEnabled && (
                <RowVolumeNotes
                  focus={focus}
                  focusRef="stashVolume"
                  measureUnit={measureUnit}
                  onChange={this.volumeChange}
                  onFocus={(focusId) => this.setState({ focus: focus === focusId ? "" : focusId })}
                  volume={stashVolume}
                  labelStyle={Styles.fullWidth}
                />
              )}
            </View>
          )}
          <View style={styles.buttons}>
            <ButtonRound
              white
              bordered
              onPress={this.goBack}
              style={styles.cancelBtn}
            >
              <Label lightGrey2 weightBold>
                Cancel
              </Label>
            </ButtonRound>
            <ButtonRound
              blue
              disabled={stashEnabled && (!stashVolume || stashVolume === "0")}
              testID="save-session"
              onPress={this.onConfirmSave}
              style={styles.cancelBtn}
            >
              <Label white weightBold>
                Save
              </Label>
            </ButtonRound>
          </View>
        </KeyboardAwareScrollView>

        {deletingEntry && (
          <ConfirmationToast
            onPressConfirm={this.deleteSession}
            onPressDeny={() => this.setState({ deletingEntry: !deletingEntry })}
            subtitle={M.CONFIRM_REMOVE_SESSION}
            title={M.REMOVE_SESSION}
          />
        )}

        {shouldConfirm && (
          <ConfirmationToast
            title={M.NO_AMOUNT}
            subtitle={M.CONTINUE_NO_AMOUNT}
            onPressConfirm={this.onSave}
            onPressDeny={this.onConfirmDeny}
          />
        )}
        {showEditConfirm && (
          <ConfirmationToast
            title="Are you sure?"
            subtitle={M.CONFIRM_SAVE_CHANGES}
            option1="Cancel"
            option2="Yes, I’m sure"
            onPressConfirm={() => {
              this.setState({ showEditConfirm: false });
              closeModal();
            }}
            onPressDeny={() => this.setState({ showEditConfirm: false })}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    padding: 30,
    paddingTop: 8,
    backgroundColor: Colors.background
  },
  note: {
    marginTop: 0,
  },
  breastTypeStyle: {
    marginTop: 8,
    marginBottom: 8
  },
  cancelBtn: {
    width: "47%",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  deleteIcon: {
    fontSize: 16,
    color: Colors.coral,
    marginRight: 8,
  },
  deleteLabel: {
    paddingTop: Platform.OS === "android" ? 3 : 0,
    color: Colors.coral,
  },
  noteView: {
    marginTop: 16,
  },
  volumeText: {
    marginTop: 10
  },
  volumeView: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  },
  leftVolume: {
    flexDirection: "row",
    alignItems: "center"
  },
  rightVolume: {
    flexDirection: "row",
    alignItems: "center"
  },
  amount: {
    marginTop: 5,
    marginBottom: 20
  },
  programView: {
    marginTop: 10
  },
  programSelectView: {
    backgroundColor: Colors.tertiaryLighter,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 45
  },
  programSelectViewNewSess: {
    borderWidth: 1,
    borderColor: Colors.tertiary
  },
  programLabel: {
    flex: 1
  },
  selectedProgram: {
    color: Colors.grey
  },
  downArrow: {
    color: Colors.lightGrey2
  },
  error: {
    marginTop: 10,
    textAlign: "center",
    ...Fonts.SemiBold,
    fontSize: 12,
    color: "red"
  },
  buttons: {
    flexDirection: "row",
    marginTop: 22,
    marginBottom: 40,
    justifyContent: "space-between",
    width: "100%"
  },
  stashArea: {
    marginTop: 10,
  },
  stashSwitch: {
    marginTop: 6,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.backgroundGrey,
    height: 44,
    borderRadius: 4,
    paddingLeft: 15
  }
});

Editing.propTypes = {
  sessionSave: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  validateSession: PropTypes.func,
  status: PropTypes.number,
  createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  duration: PropTypes.number,
  actionType: PropTypes.string,
  programName: PropTypes.string,
  keey: PropTypes.string,
  breastType: PropTypes.string,
  removeSession: PropTypes.func,
  saveStash: PropTypes.func,
  logsMap: PropTypes.object,
  newSession: PropTypes.bool,
  editAutoPumpSession: PropTypes.bool,
  startedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  finishedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  volumeBreastSide: PropTypes.object,
  notes: PropTypes.string,
  sessionType: PropTypes.string,
  measureUnit: PropTypes.string,
  programsSelect: PropTypes.array,
  programId: PropTypes.string
};
