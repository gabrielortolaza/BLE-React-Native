import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Text, View, TouchableOpacity, Image, BackHandler, Switch, Platform
} from "react-native";
import firebase from "@react-native-firebase/app";
import ReactTimeout from "react-timeout";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import SessionHeader from "./SessionHeader";
import RowDateTime from "./RowDateTime";
import RowVolumeNotes from "./RowVolumeNotes";
import {
  Label, TimeTicker, SegmentInfo, ConfirmationToast
} from "../Shared";
import MultilineInput from "../Shared/MultilineInput";
import { fluidFrom, fluidTo } from "../../Services/Convert";
import {
  Colors, Fonts, Images, Styles
} from "../../Themes";
import StyleSheet from "../../Proportional";
import * as M from "../../Config/messages";

// import Pumping from "../../Assets/Images/sessionPump260.png";
// import Feeding from "../../Assets/Images/sessionFeed260.png";

import {
  SESSION_BEGIN, SESSION_RUNNING, SESSION_PAUSED,
  SESSION_STOPPED, BREAST_TYPE, LOG_TIMER,
  SESSION_KIND_RECORDING, SESSION_TYPE_ADDED, SESSION_TYPE_REMOVED
} from "../../Config/constants";
import Icon from "../Shared/Icon";
import { appWidth } from "../../Services/SharedFunctions";
import {
  FEED_SESSION, PUMP_SESSION, RECORD_SESSION,
  STASH_SESSION, ADD_STASH, REMOVE_STASH
} from "../../Config/Analytics";

const Touchable = TouchableOpacity;

const PLACEHOLDER_FEED = "Add something..";
const PLACEHOLDER_PUMP = "Add something..";

const breastTypeArr = [
  { name: "Left", key: BREAST_TYPE.left },
  { name: "Right", key: BREAST_TYPE.right },
  { name: "Both", key: BREAST_TYPE.both }
];

class Recording extends Component {
  constructor(props) {
    super(props);

    this.state = {
      focus: "",
      volumeLeft: 0,
      volumeRight: 0,
      shouldConfirm: false,
      stashEnabled: false,
      stashVolume: 0,
      error: false
    };
  }

  componentDidMount() {
    const {
      volume, measureUnit, volumeBreastSide,
      status, breastType, navigation,
      showTimerButton
    } = this.props;

    BackHandler.addEventListener("hardwareBackPress", () => {
      if (status === SESSION_PAUSED) {
        this.shouldCancel();
        return true;
      }
    });

    const volumeConverted = fluidTo({
      measureUnit,
      value: volume || 0
    });

    let volumeLeftConverted = 0;
    let volumeRightConverted = 0;

    if (breastType === BREAST_TYPE.left) {
      volumeLeftConverted = volumeConverted;
    } else if (breastType === BREAST_TYPE.right) {
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
      volumeLeft: volumeLeftConverted,
      volumeRight: volumeRightConverted,
      volumeBreastSideRight: volumeBreastSideRightConverted,
      volumeBreastSideLeft: volumeBreastSideLeftConverted
    });

    this.focusListener = navigation.addListener(
      "focus",
      () => {
        const { showButtonOfTimer } = this.props;

        // If show timer draggable
        if (showButtonOfTimer) {
          showTimerButton(null);
        }
      }
    );
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

      if (breastType === BREAST_TYPE.left) {
        this.setState({ volumeLeft: volumeConverted });
      } else if (breastType === BREAST_TYPE.right) {
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

  componentWillUnmount() {
    const { status, showTimerButton } = this.props;

    // If timer is running, make button visible
    if (status === SESSION_RUNNING) {
      showTimerButton(LOG_TIMER);
    }

    this.focusListener();
  }

  onPlay = () => {
    const {
      sessionResume, status, sessionStart,
      sessionType
    } = this.props;

    status === SESSION_BEGIN ? sessionStart("record", sessionType, { status: 1 }) : sessionResume(status);
  };

  onPause = () => {
    const {
      sessionPause, status, duration,
      resumedAt
    } = this.props;

    sessionPause(status, duration, resumedAt);
  };

  onStop = () => {
    const {
      sessionStop, sessionType, volume,
      notes, status, duration,
      resumedAt
    } = this.props;

    sessionStop(status, duration, resumedAt);

    if (sessionType === "pump") {
      if (!volume && this.refInputVolume) {
        // this.refInputVolume.focus(); COMBAK, focus baseed on default side
      }
    } else if (!notes && this.refInputNotes) {
      this.refInputNotes.focus();
    }
  };

  onConfirmSave = () => {
    const {
      sessionType, breastType, measureUnit,
      notes, saveStash
    } = this.props;
    const {
      volumeBreastSideLeft, volumeBreastSideRight, stashEnabled,
      stashVolume
    } = this.state;

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
        sessionType: sessionType === "pump" ? SESSION_TYPE_ADDED : SESSION_TYPE_REMOVED
      };

      const { uid } = firebase.auth().currentUser;
      saveStash(uid, stashData);
      firebase.analytics().logEvent(STASH_SESSION, {
        type: sessionType === "pump" ? ADD_STASH : REMOVE_STASH,
        newSession: true
      });
    }

    const volume = this.getSideVolume();

    if (sessionType === "pump") {
      if (
        ((breastType !== BREAST_TYPE.both) && (volume === 0 || volume === null))
        || ((breastType === BREAST_TYPE.both)
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

  getSideVolume = () => {
    const { breastType } = this.props;
    const { volumeLeft, volumeRight } = this.state;

    let volume = 0;

    if (breastType === BREAST_TYPE.left) {
      volume = volumeLeft;
    } else if (breastType === BREAST_TYPE.right) {
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
      measureUnit
    } = this.props;

    const { volumeBreastSideLeft, volumeBreastSideRight } = this.state;

    const { uid } = firebase.auth().currentUser;

    const convertedVolume = fluidFrom(
      {
        measureUnit,
        value: this.getSideVolume()
      }
    );

    const volumeBreastSideLeftConverted = fluidFrom(
      {
        measureUnit,
        value: volumeBreastSideLeft
      }
    );

    const volumeBreastSideRightConverted = fluidFrom(
      {
        measureUnit,
        value: volumeBreastSideRight
      }
    );

    const data = {
      status,
      duration,
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
      sessionKind: SESSION_KIND_RECORDING
    };

    validateSession(data)
      .then((x) => {
        sessionSave(uid, x);
        const logName = sessionType === "feed" ? FEED_SESSION : PUMP_SESSION;
        firebase.analytics().logEvent(logName, {
          type: RECORD_SESSION,
          newSession: true
        });
        closeModal();
      })
      .catch((x) => this.setState({ error: x }));
  };

  onConfirmDeny = () => {
    this.setState({ shouldConfirm: false });
  };

  shouldCancel = () => this.setState({ shouldCancel: true });

  onCancelConfirm = () => {
    const { sessionReset, navigation } = this.props;

    this.setState({ shouldCancel: false });
    sessionReset();
    navigation.goBack();
  };

  onCancelDeny = () => this.setState({ shouldCancel: false });

  setRefInputNotes = (ref) => {
    this.refInputNotes = ref;
  };

  setRefInputVolume = (ref) => {
    this.refInputVolume = ref;
  };

  onFocus = (focusId) => {
    const { focus } = this.state;
    this.setState({ focus: focus === focusId ? "" : focusId });
  };

  onClose = () => {
    const { actionType, sessionReset, minimizeModal } = this.props;

    if (actionType === "manual") {
      sessionReset();
    }
    minimizeModal();
  };

  volumeChange = (focus, value) => {
    const { breastType } = this.props;

    if (focus === "volume") {
      if (breastType === BREAST_TYPE.left) {
        this.setState({
          volumeLeft: value,
          stashVolume: value
        });
      } else if (breastType === BREAST_TYPE.right) {
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

  render() {
    const {
      startedAt, finishedAt, measureUnit,
      notes, status, breastType,
      resumedAt, duration, actionType,
      sessionType, onChange
    } = this.props;

    const {
      focus, shouldCancel, shouldConfirm,
      error, volumeLeft, volumeRight,
      volumeBreastSideLeft, volumeBreastSideRight,
      stashVolume, stashEnabled
    } = this.state;

    const isManual = actionType === "manual";
    const isPumping = sessionType === "pump";
    const isAboutToStart = status === SESSION_BEGIN;
    const isRunning = status === SESSION_RUNNING;
    const isPaused = status === SESSION_PAUSED;
    const isStopped = status === SESSION_STOPPED;

    return (
      <View style={styles.container}>
        <SessionHeader
          sessionType={sessionType}
          onChange={onChange}
        />
        <KeyboardAwareScrollView>
          <RecordingInfo
            finishedAt={finishedAt}
            focus={focus}
            isPumping={isPumping}
            measureUnit={measureUnit}
            notes={notes || ""}
            onChange={onChange}
            onFocus={this.onFocus}
            setRefInputNotes={this.setRefInputNotes}
            setRefInputVolume={this.setRefInputVolume}
            startedAt={startedAt}
            volumeLeft={volumeLeft}
            volumeRight={volumeRight}
            breastType={breastType}
            sessionType={sessionType}
            isStopped={isStopped}
            stashVolume={stashVolume}
            stashEnabled={stashEnabled}
            changeStashEnabled={(val) => this.setState({ stashEnabled: val })}
            volumeBreastSideLeft={volumeBreastSideLeft}
            volumeBreastSideRight={volumeBreastSideRight}
            volumeChange={this.volumeChange}
          />

          {
            !isStopped && (
              <View style={styles.imageFrame}>
                <Image
                  source={isPumping ? Images.sessionPumping : Images.sessionFeeding}
                  style={styles.image}
                />
              </View>
            )
          }

          {!isManual && (
            <View style={styles.controls}>
              <RecordingLabel isRunning={isRunning} isPaused={isPaused} />
              <TimeTickerWithTimeout
                resumedAt={resumedAt}
                status={status}
                duration={duration}
              />
              {error && (
                <Text style={styles.error}>{error}</Text>
              )}
              <RecordingControlsButtons
                isAboutToStart={isAboutToStart}
                isRunning={isRunning}
                isStopped={isStopped}
                isPaused={isPaused}
                stashVolume={stashVolume}
                stashEnabled={stashEnabled}
                shouldCancel={this.shouldCancel}
                onPause={this.onPause}
                onPlay={this.onPlay}
                onStop={this.onStop}
                onSave={this.onConfirmSave}
              />
            </View>
          )}

          {error && (
            <Text style={styles.error}>{error}</Text>
          )}

          {shouldCancel && (
            <ConfirmationToast
              title={M.CANCEL_SESSION}
              subtitle={M.CONFIRM_CANCEL_SESSION}
              onPressConfirm={this.onCancelConfirm}
              onPressDeny={this.onCancelDeny}
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
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

class RecordingInfo extends React.PureComponent {
  segmentChange = (x) => {
    const { onChange } = this.props;

    onChange("breastType", x);
  };

  render() {
    const {
      finishedAt, focus, onChange,
      startedAt, isPumping, measureUnit,
      notes, onFocus, breastType,
      sessionType, isStopped, volumeLeft,
      volumeRight, volumeBreastSideLeft, volumeBreastSideRight,
      volumeChange, stashEnabled, stashVolume,
      changeStashEnabled
    } = this.props;

    return (
      <View style={styles.subContainer}>
        <Label font12 weightBold mt8 mb10>
          START TIME
        </Label>
        <RowDateTime
          finishedAt={finishedAt}
          focus={focus}
          onChange={onChange}
          onFocus={onFocus}
          startedAt={startedAt}
          editable={false}
        />

        {
          isStopped && (
            <View style={Styles.fullWidth}>
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

              {sessionType === "feed" && (
                <View
                  style={styles.feedSideMargin}
                />
              )}

              {((breastType === BREAST_TYPE.left || breastType === BREAST_TYPE.right) && sessionType !== "feed") ? (
                <RowVolumeNotes
                  focus={focus}
                  focusRef="volume"
                  underline
                  hideVolume={!isPumping}
                  measureUnit={measureUnit}
                  onChange={volumeChange}
                  onFocus={(focusId) => { onFocus(focusId); }}
                  volume={breastType === BREAST_TYPE.left ? volumeLeft : volumeRight}
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
                        onChange={volumeChange}
                        onFocus={(focusId) => { onFocus(focusId); }}
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
                        onChange={volumeChange}
                        onFocus={(focusId) => { onFocus(focusId); }}
                        volume={volumeBreastSideRight}
                        labelStyle={{ width: appWidth / 3.3 }}
                      />
                    </View>
                  </View>
                )
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
                  placeholder={isPumping ? PLACEHOLDER_PUMP : PLACEHOLDER_FEED}
                  error={notes?.length > 500 ? "Maximum notes 500 characters" : ""}
                />
              </View>
              <View style={styles.stashArea}>
                <View style={styles.stashSwitch}>
                  <Label font12 weightSemiBold>
                    {`${sessionType === "pump" ? "ADD TO" : "REMOVE FROM"} STASH`}
                  </Label>
                  <Switch
                    trackColor={{ true: Colors.windowsBlue, false: Colors.lightGrey300 }}
                    thumbColor={Platform.OS === "android" ? Colors.backgroundThree : null}
                    onValueChange={() => changeStashEnabled(!stashEnabled)}
                    value={stashEnabled}
                  />
                </View>
                {stashEnabled && (
                  <RowVolumeNotes
                    focus={focus}
                    focusRef="stashVolume"
                    measureUnit={measureUnit}
                    onChange={volumeChange}
                    onFocus={(focusId) => onFocus(focusId)}
                    volume={stashVolume}
                    labelStyle={Styles.fullWidth}
                  />
                )}
              </View>
            </View>
          )
        }
      </View>
    );
  }
}

RecordingInfo.propTypes = {
  finishedAt: PropTypes.number,
  focus: PropTypes.string.isRequired,
  isPumping: PropTypes.bool,
  measureUnit: PropTypes.string.isRequired,
  notes: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  // setRefInputNotes: PropTypes.func.isRequired,
  // setRefInputVolume: PropTypes.func.isRequired,
  startedAt: PropTypes.number,
  isStopped: PropTypes.bool,
  volumeLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  volumeRight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  sessionType: PropTypes.string,
  breastType: PropTypes.string,
  stashVolume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  stashEnabled: PropTypes.bool,
  changeStashEnabled: PropTypes.func,
  volumeBreastSideLeft: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  volumeBreastSideRight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  volumeChange: PropTypes.func
};

class RecordingLabel extends React.PureComponent {
  render() {
    const { isRunning, isPaused } = this.props;
    return (
      <View>
        {isRunning && <Text style={styles.labelRecording}>Recording...</Text>}
        {isPaused && <Text style={styles.labelPaused}>Paused</Text>}
      </View>
    );
  }
}

RecordingLabel.propTypes = {
  isPaused: PropTypes.bool,
  isRunning: PropTypes.bool
};

class RecordingControlsButtons extends React.PureComponent {
  render() {
    const {
      isRunning, isStopped, isPaused,
      stashEnabled, stashVolume,
      isAboutToStart, shouldCancel, onPause,
      onPlay, onStop, onSave
    } = this.props;
    return (
      <View style={styles.controlButtons}>
        <Touchable onPress={shouldCancel}>
          <Icon
            name="close-circle-outline"
            style={styles.actionSmall}
          />
        </Touchable>
        {isRunning && (
          <Touchable onPress={onPause}>
            <Icon
              name="pause-circle"
              style={[styles.actionLarge, styles.playBtn]}
            />
          </Touchable>
        )}
        {(isStopped || isPaused || isAboutToStart) && (
          <Touchable onPress={onPlay}>
            <Icon
              name="play-circle"
              style={
                isPaused
                  ? [styles.actionLarge, styles.playBtn]
                  : [styles.actionSmall, styles.playBtn]
              }
            />
          </Touchable>
        )}
        {!isStopped && (
          <Touchable onPress={onStop}>
            <Icon
              name="stop-circle-outline"
              style={[styles.actionSmall, styles.stopBtn]}
            />
          </Touchable>
        )}
        {isStopped && (
          <Touchable onPress={onSave} disabled={stashEnabled && (!stashVolume || stashVolume === "0")}>
            <Icon
              name="checkmark-circle"
              style={[styles.actionSmall, styles.saveBtn]}
            />
          </Touchable>
          // <ButtonRound style={{ alignSelf: "center" }} blue onPress={onSave}>
          //   <Label white font11 weightBold>
          //     Save
          //   </Label>
          // </ButtonRound>
        )}
      </View>
    );
  }
}

RecordingControlsButtons.propTypes = {
  isRunning: PropTypes.bool,
  isStopped: PropTypes.bool,
  isPaused: PropTypes.bool,
  isAboutToStart: PropTypes.bool,
  stashVolume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  stashEnabled: PropTypes.bool,
  shouldCancel: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

const TimeTickerWithTimeout = ReactTimeout(TimeTicker);

export default Recording;

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: Colors.background,
  },
  subContainer: {
    padding: 30,
    paddingTop: 15,
  },
  note: {
    marginTop: 0,
  },
  breastTypeStyle: {
    marginTop: 8,
    marginBottom: 8
  },
  feedSideMargin: {
    marginTop: 48
  },
  infoRows: {
    flexDirection: "row",
    marginVertical: 5
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
  volumeText: {
    marginTop: 10
  },
  noteView: {
    marginTop: 16,
  },
  labelRecording: {
    ...Fonts.SemiBold,
    fontSize: 10,
    textAlign: "center",
    color: Colors.coral,
    margin: 5
  },
  labelPaused: {
    ...Fonts.SemiBold,
    fontSize: 10,
    textAlign: "center",
    color: "rgb(167, 167, 167)",
    margin: 5
  },
  controls: {
    height: 216,
    justifyContent: "space-around",
    padding: 10
  },
  error: {
    marginTop: 10,
    textAlign: "center",
    ...Fonts.SemiBold,
    fontSize: 12,
    color: "red"
  },
  controlButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 45
  },
  timeLabels: {
    borderRadius: 2,
    backgroundColor: "rgba(132, 198, 191, 0.1)",
    paddingVertical: 10,
    textAlign: "center",
    fontSize: 12,
    ...Fonts.SemiBold,
    color: Colors.greyishBrown,
    flex: 1
  },
  timeLabelMiddle: {
    marginHorizontal: 4
  },
  volumeLabel: {
    borderRadius: 2,
    backgroundColor: "rgba(132, 198, 191, 0.1)",
    paddingVertical: 10,
    textAlign: "center",
    fontSize: 12,
    ...Fonts.SemiBold,
    color: Colors.greyishBrown,
    minWidth: 60,
    marginRight: 8
  },
  actionLarge: {
    fontSize: 60
  },
  actionSmall: {
    fontSize: 45
  },
  playBtn: {
    color: Colors.blue
  },
  stopBtn: {
    color: Colors.red
  },
  saveBtn: {
    color: Colors.blue
  },
  imageFrame: {
    aspectRatio: 1,
    flexDirection: "row",
    alignSelf: "center",
    minHeight: 200,
    marginTop: 10
  },
  image: {
    aspectRatio: 1,
    borderRadius: 4
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

Recording.propTypes = {
  startedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  finishedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  volumeBreastSide: PropTypes.object,
  notes: PropTypes.string,
  status: PropTypes.number,
  breastType: PropTypes.string,
  keey: PropTypes.string,
  validateSession: PropTypes.func,
  navigation: PropTypes.object,
  measureUnit: PropTypes.string,
  sessionStart: PropTypes.func,
  resumedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  duration: PropTypes.number,
  sessionPause: PropTypes.func.isRequired,
  sessionResume: PropTypes.func.isRequired,
  sessionReset: PropTypes.func.isRequired,
  sessionStop: PropTypes.func.isRequired,
  sessionSave: PropTypes.func.isRequired,
  saveStash: PropTypes.func,
  closeModal: PropTypes.func.isRequired,
  showTimerButton: PropTypes.func.isRequired,
  minimizeModal: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  actionType: PropTypes.string,
  sessionType: PropTypes.string,
  showButtonOfTimer: PropTypes.string
};
