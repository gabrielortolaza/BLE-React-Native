import React, { Component } from "react";
import {
  View, StyleSheet, TouchableOpacity, Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "@react-native-firebase/app";
import Carousel from "react-native-reanimated-carousel";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Label as Text } from "../../Shared";
import Icon from "../../Shared/Icon";
import CollapsedSteps from "./CollapsedSteps";
import PumpAction from "./PumpAction";
import PumpCircle from "./PumpCircle";
import PumpControl from "./PumpControl";
import ProgramRecordControls from "../ProgramRecord/ProgramRecordControls";
import ConfirmationToast from "../../Shared/ConfirmationToast";
import PumpStatusHeader from "../../Shared/AppHeader/PumpStatusHeader";
import Container from "../../Shared/Container";
import ProgramCard from "../../Shared/ProgramCard";
import { Images, Colors } from "../../../Themes";
import {
  MODES, EXPRESSION, LETDOWN,
} from "../../../Config/Modes";
import * as C from "../../../Config/constants";

import {
  setMode, setAll, setCycle, setVacuum,
  stopSession, pauseSession, startSession, stopTimer,
  updateImageCard, addMessage, setCurrentProgram,
  setTabChanged, setSuperGenieLoad, setLastPlayedMode,
  newProgramId, showTimerButton, updatePumpStatus
} from "../../../Actions";
import * as M from "../../../Config/messages";
import { isEmpty } from "../../../Services/SharedFunctions";

class ManualRun extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modeId: LETDOWN,
      vacuumOptions: [],
      cycleOptions: [],
      vacuumIndex: 0,
      cycleIndex: 0,
      type: props.route.params && props.route.params.type,
      showTutorial: props.route.params && props.route.params.showTutorial,
      showSaveWarning: false,
      showRecordPauseWarning: false,
      showStepsCarousel: false,
      isNewRecordPauseWarning: true,
      userStoppedPump: false,
    };

    this.previousCycle = {
      1: null,
      2: null
    };

    this.previousVacuum = {
      1: null,
      2: null
    };

    this._retrieveData("manualRunImage");
  }

  componentDidMount() {
    const {
      pump, profile, setSuperGenieLoad,
      navigation, showTimerButton,
    } = this.props;
    const {
      mode, speed, strength,
      playStatus, currentProgram
    } = pump;

    console.log("current program:::", currentProgram);
    if (isEmpty(currentProgram) || !currentProgram.id || currentProgram.pumpName) {
      // https://app.asana.com/0/1203891181269272/1203833571260711
      // first enter of manual run or current program is associated with program play
      // instead of setting current program before navigating,
      // need to set in this screen
      this.updateCurrentProgram();

      // https://app.asana.com/0/1203789513182257/1203765891198727
      this.resetTotalTime();
    }

    const { manualSettings } = profile;
    const modeId = manualSettings?.mode === "expression" ? EXPRESSION : LETDOWN;
    this.setState({ modeId }); // Set mode from profile
    let modeConfig = MODES[modeId];

    // if loaded manual directly without home page,
    // need to set status of superGenieLoad as true
    // task: 1202000463631709
    setSuperGenieLoad(true);

    if (modeId !== mode) {
      if (playStatus === C.OP_STOP) {
        // Set mode from profile
        setMode(modeId);
      } else if (mode === EXPRESSION || mode === LETDOWN) {
        // If pump is playing, set as current mode of pump
        this.setState({ modeId: mode });
        modeConfig = MODES[mode];
      }
      // TODO: when mode is undefined?
    }

    const vacuumOptions = modeConfig.vacuum[0];
    const cycleOptions = modeConfig.cycle[0];

    this.setState({
      vacuumOptions,
      cycleOptions
    }, async () => {
      if (manualSettings?.expCycle && manualSettings?.expVacuum
        && manualSettings?.letCycle && manualSettings?.letVacuum
        && playStatus === C.OP_STOP) {
        // Set manual settings from profile
        let newVacuum;
        let newCycle;
        // eslint-disable-next-line react/destructuring-assignment
        if (this.state.modeId === EXPRESSION) {
          newVacuum = manualSettings?.expVacuum;
          newCycle = manualSettings?.expCycle;
        } else {
          newVacuum = manualSettings?.letVacuum;
          newCycle = manualSettings?.letCycle;
        }

        this.previousVacuum[1] = manualSettings.expVacuum;
        this.previousCycle[1] = manualSettings.expCycle;
        this.previousVacuum[2] = manualSettings.letVacuum;
        this.previousCycle[2] = manualSettings.letCycle;

        await this.setCycleIndex(cycleOptions.findIndex((c) => c === parseInt(newCycle, 10)));
        await this.setVacuumIndex(vacuumOptions.findIndex((c) => c === parseInt(newVacuum, 10)));
        // eslint-disable-next-line react/destructuring-assignment
        setAll(parseInt(newCycle, 10), parseInt(newVacuum, 10), this.state.modeId);
      } else {
        await this.setCycleIndex(cycleOptions.findIndex((c) => c === speed));
        await this.setVacuumIndex(vacuumOptions.findIndex((c) => c === strength));
      }
    });

    // save last play mode when entering manual screen
    setLastPlayedMode({ id: C.LAST_PLAY_MODE.MANUAL });

    this.contentView.scrollToEnd({ animated: true });

    this.focusListener = navigation.addListener(
      "focus",
      () => {
        const { showButton } = this.props;

        // If show timer draggable
        if (showButton) {
          showTimerButton(null);
        }
      }
    );
  }

  // eslint-disable-next-line camelcase
  async UNSAFE_componentWillReceiveProps(nextProps) {
    const { pump, setCurrentProgram } = this.props;
    if (pump.mode !== nextProps.pump.mode
      || pump.speed !== nextProps.pump.speed
      || pump.strength !== nextProps.pump.strength) {
      const { pump } = nextProps;
      const {
        speed, mode, strength,
      } = pump;
      const {
        modeId, cycleIndex, cycleOptions, vacuumIndex, vacuumOptions,
        vacuum, cycle
      } = this.state;

      // console.log("ManualRun_componentWillReceiveProps", pump);

      if (mode !== modeId) {
        console.log("auto toggle mode");
        await this.toggleMode();
      }

      if (speed !== cycleOptions[cycleIndex]) {
        await this.setCycleIndex(cycleOptions.findIndex((c) => c === speed));
      }

      if (strength !== vacuumOptions[vacuumIndex]) {
        await this.setVacuumIndex(vacuumOptions.findIndex((c) => c === strength));
      }

      if (modeId === mode && vacuum === strength && cycle === speed) return;
      // if (playStatus !== C.OP_START) return;
      setTimeout(() => {
        if (pump.currentProgram.steps.length > 24) {
          addMessage(M.ERROR_SAVE_PROGRAM_25_STEPS);
          return;
        }
        if (pump.mode !== mode || pump.strength !== strength || pump.speed !== speed) return;
        this.updateDuration().then(() => {
          const { currentProgram } = pump;
          // add new sesssion
          currentProgram.steps.push({
            duration: 0,
            mode,
            vacuum: strength,
            cycle: speed
          });
          setCurrentProgram(currentProgram);
        });
      }, 200);
    }
  }

  componentDidUpdate(prevProps) {
    const { navigation, route, superGenieLoad } = this.props;
    // TODO react navigation v6 issue
    // const { routes } = navigation.dangerouslyGetState();
    // const lastRoute = routes?.slice(-1)[0];

    const { params } = route;
    const prevPlayOptions = params?.prevPlayOptions;

    if (prevProps.superGenieLoad && !superGenieLoad) {
      // go back if pump is disconnected
      // Don't go back if other screen is opened
      this.checkGoBackNavigate(prevPlayOptions, navigation);
    }
  }

  componentWillUnmount() {
    const { pump, showTimerButton } = this.props;
    const { playStatus } = pump;

    if (playStatus !== C.OP_STOP) {
      showTimerButton(C.MANUAL_TIMER);
    }

    this.focusListener();
  }

  initCurrentProgram = () => {
    const { setCurrentProgram } = this.props;
    setCurrentProgram({ ...C.EMPTY_PROGRAM, steps: [] });
  };

  resetTotalTime = () => {
    const { updatePumpStatus } = this.props;
    updatePumpStatus({
      activeProgram: { totalTime: 0 }
    });
  };

  updateCurrentProgram = () => {
    const { pump, setCurrentProgram } = this.props;
    const { programs } = pump;
    const newPId = newProgramId(programs);
    setCurrentProgram({
      ...C.EMPTY_PROGRAM, steps: [], id: newPId, name: `Program ${newPId}`
    });
  };

  checkGoBackNavigate = (prevPlayOptions, navigation) => {
    // Return to dashboard when user navigate direct from playButton
    if (prevPlayOptions === "manual") {
      navigation.replace("Tabs");
    } else {
      navigation.goBack();
    }
  };

  setCycleIndex = (index) => {
    if (index < 0) return;
    const { modeId, vacuumIndex } = this.state;
    const vacuumOptions = MODES[modeId].vacuum[index];
    return new Promise((resolve) => {
      try {
        this.setState({
          cycleIndex: index,
          vacuumOptions,
          vacuumIndex: (vacuumOptions.length > vacuumIndex ? vacuumIndex : vacuumOptions.length - 1)
        }, resolve);
      } catch (e) {
        console.log(e);
      }
    });
  };

  _retrieveData = async (type) => {
    const { pump, updateImageCard } = this.props;
    const { imageCard } = pump;

    try {
      const value = await AsyncStorage.getItem(type);
      if (value !== null) {
        // We have data!!
        imageCard.manualRunImage = value;
        updateImageCard(imageCard);
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  };

  setVacuumIndex = (index) => {
    if (index < 0) return;
    const { modeId, cycleIndex } = this.state;
    const cycleOptions = MODES[modeId].cycle[index];

    return new Promise((resolve) => {
      try {
        this.setState({
          vacuumIndex: index,
          cycleOptions,
          cycleIndex: (cycleOptions.length > cycleIndex ? cycleIndex : cycleOptions.length - 1)
        }, resolve);
      } catch (e) {
        console.log(e);
      }
    });
  };

  toggleMode = () => {
    const { pump } = this.props;
    const { mode } = pump;
    const { modeId } = this.state;

    const modeId2 = modeId === EXPRESSION ? LETDOWN : EXPRESSION;

    const vacuumOptions = MODES[modeId2].vacuum[0];
    const cycleOptions = MODES[modeId2].cycle[0];

    if (mode !== modeId2) {
      // Doing the next 4 steps because manualSettings was stored in the user profile
      // in the cloud as a string rather than a number, need to eventually change to number
      // if feasible
      let cycle = this.previousCycle[modeId2] || cycleOptions[0];
      if (typeof cycle !== "number") { cycle = Number(cycle); }
      let vacuum = this.previousVacuum[modeId2] || vacuumOptions[0];
      if (typeof vacuum !== "number") { vacuum = Number(vacuum); }

      setAll(
        cycle,
        vacuum,
        modeId2,
        true
      );
    }

    firebase.analytics().logEvent(`Manual_toggled_to_${modeId2 === LETDOWN ? "LETDOWN" : "EXPRESSION"}`);

    return new Promise((resolve) => {
      this.setState({
        vacuumOptions, cycleOptions, modeId: modeId2
      }, resolve);
    });
  };

  onTutorialValueChange = (name) => {
    const { vacuumIndex, cycleIndex } = this.state;
    if (name === "cycleStep") {
      this.onValueChange(name, cycleIndex + 1);
    } else if (name === "vacuumStep") {
      this.onValueChange(name, vacuumIndex + 1);
    } else if (name === "toggleMode") {
      this.toggleMode();
    } else if (name === "play") {
      this.onStartSession();
    } else if (name === "skip") {
      this.setState({ showTutorial: false });
    }
  };

  onValueChange = (name, index, increment) => {
    console.log(name, "trackpad onValueChange::", index);
    const { pump } = this.props;
    const {
      speed, strength, mode
    } = pump;
    const { vacuumOptions, cycleOptions } = this.state;

    if (name === "cycleStep") {
      this.setCycleIndex(index);
      if (speed !== cycleOptions[index]) {
        const cycle = cycleOptions[index];
        setCycle(cycle, increment);
        this.previousCycle[mode] = cycle;
      }
    } else {
      this.setVacuumIndex(index);
      if (strength !== vacuumOptions[index]) {
        const vacuum = vacuumOptions[index];
        setVacuum(vacuum, increment);
        this.previousVacuum[mode] = vacuum;
      }
    }
  };

  updateDuration = () => {
    return new Promise((resolve) => {
      const { pump, setCurrentProgram } = this.props;
      const {
        currentProgram, mode, strength, speed
      } = pump;
      const { length } = currentProgram.steps;
      if (length < 1) return;
      const currentDuration = this._control.getTime();
      if (currentDuration > 2) {
        // ignore steps no longer than 2s
        currentProgram.steps[length - 1].duration = currentDuration;
        setCurrentProgram(currentProgram);
      }
      this._control.resetTime();
      this.setState({
        modeId: mode,
        vacuum: strength,
        cycle: speed
      }, resolve);
    });
  };

  onStartSession = (recording = true) => {
    const { pump, startSession, setCurrentProgram } = this.props;
    const {
      currentProgram, mode, strength, speed, playStatus
    } = pump;
    const {
      modeId, vacuum, cycle, userStoppedPump
    } = this.state;

    if (userStoppedPump) {
      // Given user clicked play at stopped state, show save popup
      // Given user clicked Save Now, redirect to set up program page
      // Given user clicked No, start pumping from 00:00 state
      this.setState({ showSaveWarning: true });
      return;
    }

    if (recording) {
      if (currentProgram.steps) {
        if (currentProgram.steps.length <= 0 || (modeId !== mode
          || vacuum !== strength || cycle !== speed)) {
          currentProgram.steps.push({
            duration: 0,
            mode,
            vacuum: strength,
            cycle: speed
          });
          setCurrentProgram(currentProgram);
        }
      }
    }

    if (playStatus !== C.OP_START) startSession(speed, strength, mode);
    firebase.analytics().logEvent("Manual_play");
  };

  onStopSession = () => {
    const { stopSession } = this.props;
    stopTimer();
    stopSession({
      timer: null,
      // Total time should show total time at stopped state
      // totalTime: 0
    });

    this.setState({ userStoppedPump: true });

    // show steps below when stopped
    setTimeout(() => {
      this.updateDuration();
    }, 200);
  };

  onPauseClick = () => {
    const { pauseSession } = this.props;
    firebase.analytics().logEvent("Manual_pause");
    stopTimer();
    pauseSession(null);
  };

  onSave = () => {
    firebase.analytics().logEvent("ManualRecord_save");
    return this.updateDuration().then(() => {
      const { navigation, pump, addMessage } = this.props;
      const { currentProgram } = pump;

      this.setState({ showSaveWarning: false });

      if (currentProgram.id === C.NO_AVAILABLE_PROGRAM_ID) {
        addMessage(M.MAX_PROGRAM_ID_REACHED);
        return;
      }
      navigation.navigate("ProgramEdit", { action: "record" });

      // if (playStatus !== C.OP_STOP) this.onStopSession();
      // Do not ask to save session after save program
      // setTimeout(() => {
      //   if (currentProgram.steps && currentProgram.steps.length > 0) {
      //     this.setState({ askToSaveSession: true });
      //   } else {
      //     navigation.goBack();
      //   }
      // }, 3500);
    });
  };

  onCancel = () => {
    const {
      pump, navigation, route
    } = this.props;
    const { currentProgram, playStatus } = pump;
    const { showSaveWarning, userStoppedPump } = this.state;
    const { params } = route;
    const prevPlayOptions = params?.prevPlayOptions;

    if (userStoppedPump) {
      this.resetTotalTime();
      this.updateCurrentProgram();
      this.setState({
        userStoppedPump: false,
        showSaveWarning: false,
      }, () => {
        setTimeout(() => this.onStartSession(true), 250);
      });
      return;
    }

    const currentDuration = this._control.getTime(); // to handle saving only 1 step

    if ((currentProgram.steps?.length > 0
      && currentProgram.steps.some((item) => item.duration > 2)
      && !showSaveWarning && playStatus === C.OP_STOP)
      || (currentDuration > 2 && !showSaveWarning && playStatus === C.OP_STOP)) {
      this.setState({ showSaveWarning: true });
    } else {
      if (playStatus === C.OP_STOP) {
        // keep current steps in play or pause state
        // https://app.asana.com/0/1203891181269272/1203833571260711
        this.initCurrentProgram();
      }
      // Do not ask to save session when go back
      this.checkGoBackNavigate(prevPlayOptions, navigation);
      // if (playStatus !== C.OP_STOP) this.onStopSession();
      // if (currentProgram.steps && currentProgram.steps.length > 0) {
      //   this.setState({ askToSaveSession: true });
      // } else {
      //   navigation.goBack();
      // }
    }
  };

  render() {
    const {
      pump, navigation, addMessage, setTabChanged,
    } = this.props;
    const {
      speed, strength, playStatus,
      currentProgram, activeProgram, pumpDeviceName
    } = pump;

    const { totalTime } = activeProgram;

    const {
      vacuumOptions, cycleOptions, modeId,
      vacuumIndex, cycleIndex, showTutorial,
      showSaveWarning, showRecordPauseWarning, isNewRecordPauseWarning,
      type, showStepsCarousel
    } = this.state;

    let currentProgramSteps = [];
    if (currentProgram?.steps?.length > 0) {
      currentProgramSteps = currentProgram.steps.filter((item) => item.duration > 2);
    }

    let initialTime;
    if (type === "draggable") {
      // if navigated from draggable timer, resume at specific time
      const s = currentProgram?.steps?.reduce((sum, current) => sum + current.duration, 0) ?? 0;
      initialTime = totalTime - s;
    }

    return (
      <>
        <Container
          edges={["bottom"]}
          style={Styles.container}
          ref={(ref) => { this.contentView = ref; }}
        >
          <PumpStatusHeader showHeaderSeparator={false} showTopEdge />
          <View style={Styles.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                this.setState({ userStoppedPump: false }, this.onCancel);
              }}
              style={Styles.backBtnView}
            >
              <Icon style={Styles.backIcon} name="chevron-back" />
            </TouchableOpacity>
            <Text font20 weightBold>
              Manual Mode
            </Text>
          </View>
          <View style={Styles.ovalContainerStyle}>
            <PumpCircle
              vacuum={strength}
              cycle={speed}
              pumpName={pumpDeviceName}
              modeId={modeId}
              playStatus={playStatus}
              totalTime={totalTime}
              onPlay={() => this.onStartSession(true)}
            />
            <TouchableOpacity
              style={Styles.modeSwitch}
              onPress={() => this.toggleMode()}
            >
              <Image
                source={modeId === EXPRESSION ? Images.letdownBlue : Images.expressionBlue}
                style={Styles.modeImage}
              />
            </TouchableOpacity>
            <PumpControl
              speed={speed}
              strength={strength}
              onValueChange={(type, index, increment) => this.onValueChange(type, index, increment)}
              onNavigate={(selection, value) => {
                setTabChanged({ selection: modeId === LETDOWN ? `let${selection}` : `exp${selection}`, value });
                navigation.navigate("Settings");
              }}
              options={{ vacuum: vacuumOptions, cycle: cycleOptions }}
              index={{ vacuum: vacuumIndex, cycle: cycleIndex }}
              warnMsg={(msg) => addMessage(msg)}
              event="Manual"
            />
            {currentProgramSteps.length > 0 && (
              <View style={Styles.stepsContainer}>
                <View style={Styles.stepsHeader}>
                  <TouchableOpacity
                    style={Styles.stepsWrapper}
                    onPress={() => this.setState({ showStepsCarousel: !showStepsCarousel })}
                  >
                    <Icon
                      type="MaterialIcons"
                      name={showStepsCarousel ? "arrow-drop-up" : "arrow-drop-down"}
                      style={Styles.stepArrow}
                    />
                    <Text font12 weightSemiBold>
                      {`STEPS (${currentProgramSteps.length}/25)`}
                    </Text>
                  </TouchableOpacity>
                  {playStatus === C.OP_STOP && (
                    <TouchableOpacity onPress={this.onSave}>
                      <Text font12 weightSemiBold blue underline>
                        SAVE AS A NEW PROGRAM
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {showStepsCarousel ? (
                  <Carousel
                    loop={false}
                    style={Styles.carousel}
                    width={170 + 50}
                    height={180}
                    data={currentProgramSteps}
                    ref={(c) => { this._carousel = c; }}
                    renderItem={({ item, index }) => (
                      <ProgramCard
                        index={index}
                        programLength={currentProgramSteps.length}
                        programData={item}
                        disableReordering
                        hideActions
                      />
                    )}
                  />
                ) : (
                  <CollapsedSteps currentProgramSteps={currentProgramSteps} />
                )}
              </View>
            )}
            {/* it's rendered but invisible */}
            <ProgramRecordControls
              // onSave={this.onSave}
              // canSave={currentProgram && currentProgram.steps.length > 0}
              // alt
              playStatus={playStatus}
              initialTime={initialTime}
              type={type}
              // textStyle={{ color: Colors.grey }}
              ref={(c) => { this._control = c; }}
            />
          </View>
          {showSaveWarning && (
            <ConfirmationToast
              title={M.SAVE_RECORDING_NEW_PROGRAM}
              subtitle=""
              option1="No"
              option2="Save Now"
              onPressConfirm={this.onSave}
              onPressDeny={this.onCancel}
            />
          )}
          {showRecordPauseWarning && (
            <ConfirmationToast
              title={M.RECORDING_RESUME}
              subtitle=""
              option1="Cancel"
              option2="Pause"
              onPressConfirm={() => {
                this.setState({ showRecordPauseWarning: false });
                this.onPauseClick();
              }}
              onPressDeny={() => this.setState({ showRecordPauseWarning: false })}
            />
          )}
          {
            showTutorial
            && (
              <View style={Styles.tutorialContainer}>
                {/* <Tutorial
                  onValueChange={this.onTutorialValueChange}
                /> */}
              </View>
            )
          }
          <Image
            style={{
              width: "100%",
              // height: "100%",
              position: "absolute",
              zIndex: -99,
            }}
            resizeMode="cover"
            source={Images.manualWaveBg}
          />
        </Container>
        <View style={Styles.pumpActionContainer}>
          <PumpAction
            // Start recording always
            onPlay={() => this.onStartSession(true)}
            onStop={() => {
              firebase.analytics().logEvent("Manual_stop");
              this.onStopSession();
            }}
            onPause={() => {
              if (isNewRecordPauseWarning) {
                this.setState({ showRecordPauseWarning: true, isNewRecordPauseWarning: false });
              } else {
                this.onPauseClick();
              }
            }}
            playStatus={playStatus}
          />
        </View>
      </>
    );
  }
}

ManualRun.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
  pump: PropTypes.object,
  superGenieLoad: PropTypes.bool,
  profile: PropTypes.object,
  startSession: PropTypes.func,
  pauseSession: PropTypes.func,
  stopSession: PropTypes.func,
  setCurrentProgram: PropTypes.func,
  setTabChanged: PropTypes.func,
  updateImageCard: PropTypes.func,
  addMessage: PropTypes.func,
  setSuperGenieLoad: PropTypes.func,
  showTimerButton: PropTypes.func,
  showButton: PropTypes.string,
  updatePumpStatus: PropTypes.func
};

const mapStateToProps = ({
  auth, pump, status, session
}) => ({
  profile: auth.profile,
  pump,
  superGenieLoad: status.superGenieLoad,
  showButton: session.showButton
});

const mapDispatchToProps = {
  startSession,
  pauseSession,
  stopSession,
  setCurrentProgram,
  updateImageCard,
  addMessage,
  setTabChanged,
  setSuperGenieLoad,
  showTimerButton,
  updatePumpStatus
};

export default connect(mapStateToProps, mapDispatchToProps)(ManualRun);

const Styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    paddingBottom: 100,
  },
  tutorialContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20
  },
  backBtnView: {
    padding: 8,
    position: "absolute",
    left: 8,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.grey,
  },
  ovalContainerStyle: {
    alignItems: "center",
    width: "100%",
  },
  pumpActionContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    height: "auto",
    alignItems: "center",
  },
  modeSwitch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 32,
  },
  modeImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  stepsContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 12
  },
  stepsHeader: {
    justifyContent: "space-between",
    flexDirection: "row"
  },
  stepsWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepArrow: {
    fontSize: 24,
    color: Colors.lightGrey2,
  },
  carousel: {
    width: "100%",
    marginTop: 10,
    marginBottom: 20
  }
});
