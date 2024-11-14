import React from "react";
import PropTypes from "prop-types";
import {
  View, Image, BackHandler,
  TouchableOpacity, ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "@react-native-firebase/app";
import moment from "moment";
import { connect } from "react-redux";
import { activateKeepAwake, deactivateKeepAwake } from "@sayem314/react-native-keep-awake";

import ApiProgram from "../../../Http/Program";
import { addMessage, playWantedToProgram } from "../../../Actions/Status";
import {
  newProgramId, stopTimer, setUpProgram,
  resumeProgram, startProgram, pauseSession as pauseSezion,
  stopSession as stopSezion, updateProgramState, setVacuum,
  setCycle, setCycleIndex, setVacuumIndex,
  splitProgramStep, saveChangedProgram, updateChangedProgram,
  cleanProgramUnmount, setMode, deleteProgram,
  shareProgramWithFriends, sendProgramData, duplicateProgram,
} from "../../../Actions";
import {
  isGen2Pump, stopProgramPayload, size,
  formatProgramSelectionData, formatToAPIPauseSteps,
  shareToPlBody, getPauseObj
} from "../../../Services/SharedFunctions";
import { reset, showTimerButton, start } from "../../../Actions/Session";
import PumpStatusHeader from "../../Shared/AppHeader/PumpStatusHeader";
import Text from "../../Shared/Label";
import Card from "../../Shared/Card";
import ConfirmationToast from "../../Shared/ConfirmationToast";
import InfoLabel from "../../Shared/InfoLabel";
import PumpControl from "../../Shared/PumpControl";
import { Colors, Images } from "../../../Themes";
import * as constants from "../../../Config/constants";
import * as M from "../../../Config/messages";
import { LETDOWN, EXPRESSION } from "../../../Config/Modes";
import PumpingTag from "../../Shared/PumpingTag";
import SelectionModal from "../../Shared/SelectionModal";
import PlShareModal from "../../Shared/PlShareModal";
import Container from "../../Shared/Container";
import ProgramStepInfo from "./ProgramStepInfo";
import TextMoreBox from "../../Shared/TextMoreBox";
import InfoModal from "../../Shared/InfoModal";

class ProgramRun extends React.Component {
  constructor(props) {
    super(props);

    const { pump } = props;
    const { currentProgram, playStatus } = pump;

    this.state = {
      hasInitialised: false,
      showStopWarning: false,
      deletingProgram: false,
      closeProgram: false,
      moreModalVisible: false,
      saveMessage: [
        {
          title: M.CONFIRM_SAVE_RECORDING, subtitle: "", option1: "No", option2: "Yes"
        },
        {
          title: "Save as?", subtitle: "", option1: "New", option2: "Overwrite"
        }
      ],
      saveMessageIndex: 0,
      shouldSync: false,
      shouldSyncConfirm: false,
      selectedSyncProgram: 1,
      showShareToPl: false,
      showChangeVacCyc: false,
      staticCurrentProgramSteps: currentProgram.steps.map((item) => ({ ...item })),
      showMoreProgDesc: false
    };

    if (
      playStatus !== constants.OP_START
        && playStatus !== constants.OP_PAUSE
    ) {
      this.setUpProgram();
      this.state.hasInitialised = true;
    }
  }

  componentDidMount() {
    const { pump, navigation, showTimerButton } = this.props;
    const { playStatus, pumpDevice, connectStatus } = pump;

    if (
      playStatus !== constants.OP_START
        && playStatus !== constants.OP_PAUSE
    ) {
      if (pumpDevice === constants.PUMP_DEVICE.SUPERGENIE) {
        if (connectStatus === constants.CONNECT_STATUS.CONNECTED) {
          // If connected stop any program playing on the pump
          setTimeout(() => {
            stopSezion();
          }, 500);
        }
      }
    }

    // Handle Android back button press
    BackHandler.addEventListener("hardwareBackPress", () => {
      const { pump } = this.props;
      const { playStatus } = pump;

      // If pump is playing disable back button
      if (playStatus === 1) {
        return true;
      }
    });

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

  componentDidUpdate(prevProps) {
    const { status, playWantedToProgram } = this.props;

    // Playing program after connecting
    if (
      status.canPlayWantedToProgram
        && (status.canPlayWantedToProgram !== prevProps.status.canPlayWantedToProgram)
        && status.canPlayWantedToProgram === "program"
    ) {
      playWantedToProgram(false);
      this.playSession();
    }
  }

  componentWillUnmount() {
    const { pump, cleanProgramUnmount, showTimerButton } = this.props;
    const { overwriteProgram, staticCurrentProgramSteps } = this.state;
    const {
      currentProgram, playStatus, pumpDevice,
      activeProgram
    } = pump;
    const { timer, hasPauseStep, playingProgram } = activeProgram;

    if (playingProgram && playStatus !== constants.OP_STOP) {
      showTimerButton(constants.PROGRAM_TIMER);
    }

    if (!isGen2Pump(pumpDevice)) {
      if (timer) {
        // stopTimer();
      }

      // If steps were altered and program wasn't overwritten, reset to correct(immutable)
      if (!overwriteProgram) {
        currentProgram.steps = staticCurrentProgramSteps;
      }

      const payload = {
        ...(playStatus === constants.OP_STOP && { totalTime: 0 })
      };

      cleanProgramUnmount(payload);

      if (hasPauseStep) {
        deactivateKeepAwake();
      }
    }

    this.focusListener();
  }

  goBack = () => {
    const { navigation } = this.props;

    navigation.goBack();
  };

  setUpProgram = () => {
    const { pump, setUpProgram } = this.props;
    const {
      currentProgram, speed, strength
    } = pump;

    setUpProgram(currentProgram, speed, strength);
  };

  splitStep = (vaccycVal, type) => {
    const { pump, addMessage, splitProgramStep } = this.props;
    const { currentProgram, programSeq } = pump;
    const {
      newProgram, programAltered, currentTime,
      currentIndex, pauseSeqPassed
    } = pump.activeProgram;

    if (!programAltered) {
      // Will switch to manual mode
      // Calculate duration remaining to change step
      // const stepDuration = programData[programSeq].duration;
      if (newProgram.length > 24) {
        addMessage(M.ERROR_SAVE_PROGRAM_25_STEPS);
        return;
      } // If steps have reached max limit
      // Update current step to have new duration
      const oldStep = { // COMBAK: Use from constant structure
        cycle: newProgram[programSeq + pauseSeqPassed].cycle,
        duration: newProgram[programSeq + pauseSeqPassed].duration,
        index: newProgram[programSeq + pauseSeqPassed].index,
        mode: newProgram[programSeq + pauseSeqPassed].mode,
        originalIndex: newProgram[programSeq + pauseSeqPassed].originalIndex,
        vacuum: newProgram[programSeq + pauseSeqPassed].vacuum
      };

      const remainingDuration = newProgram[programSeq + pauseSeqPassed].duration - currentTime;
      newProgram[programSeq + pauseSeqPassed].duration = currentTime;
      // Update next steps duration, vacuum and index
      oldStep.duration = remainingDuration;

      if (type === "vacuum") {
        oldStep.vacuum = vaccycVal;
      } else if (type === "cycle") {
        oldStep.cycle = vaccycVal;
      }

      const nextNewProgramSeq = programSeq + pauseSeqPassed + 1;
      newProgram.splice(nextNewProgramSeq, 0, oldStep);

      for (let i = nextNewProgramSeq; i < 25 - nextNewProgramSeq; i++) {
        if (newProgram[i]) {
          newProgram[i].index += 1;
        }
      }
      splitProgramStep({
        newProgram,
        currentIndex: nextNewProgramSeq,
        programAltered: !programAltered,
        alteredProgramId: currentProgram.id
      });
    } else {
      if (newProgram.length > 24) {
        addMessage(M.ERROR_SAVE_PROGRAM_25_STEPS);
        return;
      } // If steps have reached max limit
      // Calculate duration remaining to change step
      // Update current step to have new duration
      const oldStep = { // COMBAK: Use from constant structure
        cycle: newProgram[currentIndex].cycle,
        duration: newProgram[currentIndex].duration,
        index: newProgram[currentIndex].index,
        mode: newProgram[currentIndex].mode,
        originalIndex: newProgram[currentIndex].originalIndex,
        vacuum: newProgram[currentIndex].vacuum
      };

      let remainingDuration;
      // If on the same step
      // If has step has already been modified
      if (newProgram[currentIndex].originalIndex === newProgram[currentIndex - 1].originalIndex) {
        let totalStepDur = 0;
        let totalPrevStepDur = 0;
        for (let i = 0; i < newProgram.length; i++) {
          if (newProgram[i].originalIndex === newProgram[currentIndex].originalIndex
            && i < currentIndex) {
            totalPrevStepDur += newProgram[i].duration;
          }
          if (newProgram[i].originalIndex === newProgram[currentIndex].originalIndex) {
            totalStepDur += newProgram[i].duration;
          }
        }
        console.log("totalStepDur & Prev", totalStepDur, totalPrevStepDur);
        remainingDuration = totalStepDur - currentTime;
        newProgram[currentIndex].duration = currentTime - totalPrevStepDur;
        console.log("set as1: ", newProgram[currentIndex].duration);
      } else {
        remainingDuration = newProgram[currentIndex].duration - currentTime;
        newProgram[currentIndex].duration = currentTime;
        console.log("set as2: ", newProgram[currentIndex].duration);
      }

      // Update next steps duration, vacuum and index
      oldStep.duration = remainingDuration;

      if (type === "vacuum") {
        oldStep.vacuum = vaccycVal;
      } else if (type === "cycle") {
        oldStep.cycle = vaccycVal;
      }

      const nextNewProgramSeq = currentIndex + 1;
      newProgram.splice(nextNewProgramSeq, 0, oldStep);

      for (let i = nextNewProgramSeq; i < 25 - nextNewProgramSeq; i++) {
        if (newProgram[i]) {
          newProgram[i].index += 1;
        }
      }
      splitProgramStep({ newProgram, currentIndex: nextNewProgramSeq });
    }
  };

  onValueChange = (name, index, increment) => {
    const { pump, setCycleIndex, setVacuumIndex } = this.props;
    const {
      strength, speed, playStatus,
      pumpDevice, mode, cycleIndex,
      vacuumIndex, vacuumOptions, cycleOptions
    } = pump;
    const {
      modeId, inPauseSeq
    } = pump.activeProgram;

    // If program not playing or in pause step
    // COMBAK: inPauseSeq for SG2
    if (playStatus === constants.OP_STOP || playStatus === constants.OP_PAUSE || inPauseSeq) return;

    if (name === "vacuumStep") {
      if (pumpDevice === constants.PUMP_DEVICE.SUPERGENIE) {
        setVacuumIndex(index, modeId, cycleIndex, undefined, true);

        if (strength !== vacuumOptions[index]) {
          // See where at and how to cut
          this.splitStep(vacuumOptions[index], "vacuum");
          setVacuum(vacuumOptions[index], increment);
        }
      } else if (isGen2Pump(pumpDevice)) {
        setVacuumIndex(index, modeId, cycleIndex, mode, true);

        if (strength !== vacuumOptions[index]) {
          setVacuum(vacuumOptions[index], increment);
        }
      }
    } else if (name === "cycleStep") {
      if (pumpDevice === constants.PUMP_DEVICE.SUPERGENIE) {
        setCycleIndex(index, modeId, vacuumIndex, undefined, true);
        if (speed !== cycleOptions[index]) {
          // See where at and how to cut
          this.splitStep(cycleOptions[index], "cycle");
          setCycle(cycleOptions[index], increment);
        }
      } else if (isGen2Pump(pumpDevice)) {
        setCycleIndex(index, modeId, vacuumIndex, mode, true);

        if (speed !== cycleOptions[index]) {
          setCycle(cycleOptions[index], increment);
        }
      }
    }
  };

  _retrieveData = async (type) => {
    const { pump } = this.props;
    const { currentProgram, imageCard } = pump;

    try {
      const value = await AsyncStorage.getItem(type);
      if (value !== null) {
        // We have data!!
        console.log(value);
        imageCard[`programRunImage${currentProgram.id}`] = value;
      }
    } catch (error) {
      // Error retrieving data
      console.error(error);
    }
  };

  checkConnectStatus = () => {
    const {
      pump, navigation,
    } = this.props;
    const { connectStatus } = pump;

    if (connectStatus !== constants.CONNECT_STATUS.CONNECTED) {
      navigation.navigate("GeniePairing", { from: "program" });
      return false;
    }
    return true;
  };

  playSession = () => {
    const {
      pump, addMessage, startProgram,
      resumeProgram
    } = this.props;
    const { hasInitialised } = this.state;
    const {
      currentProgram, playStatus, programId,
      programs, pumpDevice, programPlaying,
      programPaused
    } = pump;
    const {
      programAltered, stoppedSessionRec, inPauseSeq,
      timer, hasPauseStep, newProgram
    } = pump.activeProgram;

    if (!this.checkConnectStatus()) { return; }

    if (isGen2Pump(pumpDevice)) {
      // COMBAK: add more features similar to SG1 below

      if (programPlaying && programPaused) {
        resumeProgram(timer);
      } else {
        if (!hasInitialised) {
          this.setUpProgram();
        } else { this.setState({ hasInitialised: false }); }

        setTimeout(() => {
          startProgram(currentProgram.id, timer, programs, newProgram);
        }, 1000);
      }
    } else if (pumpDevice === constants.PUMP_DEVICE.SUPERGENIE) {
      if (inPauseSeq) return; // If in pause step

      // Have previously stopped session while recording
      if (stoppedSessionRec) {
        this.setState({ showStopWarning: true });
        return;
      }

      if (playStatus === constants.OP_PAUSE && programId === currentProgram.id) {
        resumeProgram(timer);
      } else if (playStatus === constants.OP_PAUSE && programAltered) {
        resumeProgram(timer);
      } else {
        if (!hasInitialised) {
          this.setUpProgram();
        } else { this.setState({ hasInitialised: false }); }

        setTimeout(() => {
          startProgram(currentProgram.id, timer, programs);
        }, 1000);
      }

      if (hasPauseStep) {
        addMessage(M.KEEP_PHONE_WHILE_PLAY_PROGRAM);
        activateKeepAwake();
      }
    }

    firebase.analytics().logEvent("Program_play");
  };

  pauseSession = (pauseSeq = false) => {
    const { updateProgramState, pump } = this.props;
    const { hasPauseStep } = pump.activeProgram;

    if (!this.checkConnectStatus()) { return; }

    if (pauseSeq) {
      pauseSezion();
      updateProgramState({ paused: true, inPauseSeq: true });
      return;
    }

    const { pauseSezion } = this.props;

    stopTimer();
    pauseSezion();

    if (hasPauseStep) {
      deactivateKeepAwake();
    }

    firebase.analytics().logEvent("Program_pause");
  };

  stopSession = () => {
    const { pump, stopSezion } = this.props;
    const { programAltered, hasPauseStep } = pump.activeProgram;

    if (!this.checkConnectStatus()) { return; }

    stopTimer();

    const stopProgramPload = stopProgramPayload();

    stopSezion({
      ...stopProgramPload,
      ...(programAltered && { stoppedSessionRec: true })
    });

    if (hasPauseStep) {
      deactivateKeepAwake();
    }

    firebase.analytics().logEvent("Program_stop");
  };

  // TODO
  // onSave = (amount, notes) => {
  //   const { user } = this.props;
  //   const { makeLog } = user;
  //   const { startedAt, stoppedAt } = this.state;
  //   makeLog({
  //     amount, notes, startedAt, stoppedAt
  //   });
  // }

  save = (overwrite = true) => {
    const { pump, saveChangedProgram, addMessage } = this.props;
    const { programs } = pump;
    const { newProgram, alteredProgramId } = pump.activeProgram;

    this.setState({ overwriteProgram: overwrite });

    const id = overwrite ? alteredProgramId : newProgramId(programs);
    const message = overwrite ? "program" : `as Program ${id}`;
    const pauseObj = {};

    if (id === constants.NO_AVAILABLE_PROGRAM_ID) {
      addMessage(M.MAX_PROGRAM_ID_REACHED);
      return;
    }

    // Save pause steps
    newProgram.forEach((x) => {
      if (x.pause) {
        pauseObj[x.index] = {
          duration: x.duration
        };
      }
    });

    // Remove pause steps
    const newProgramm = newProgram.filter((x) => x.pause !== true);

    // Correct indexes and delete originalIndex
    newProgramm.forEach((x, index) => {
      x.index = index;
      delete x.originalIndex;
    });

    const newProgram2 = {
      ...constants.EMPTY_PROGRAM, steps: newProgramm, id, name: `Program ${id}`
    };
    console.log("Saved alteredP:", newProgram2);

    // If pause steps present
    if (Object.keys(pauseObj).length > 0) {
      AsyncStorage.getItem("program-pause").then((val) => {
        const newVal = JSON.parse(val);
        newVal[id] = pauseObj;

        AsyncStorage.setItem("program-pause", JSON.stringify(newVal)).then(() => {
          console.log("saveChangedProgram:", newVal);
          saveChangedProgram(id, newProgram2, message);
          if (overwrite) this.goBack();
        });
      });
    } else {
      saveChangedProgram(id, newProgram2, message);
      if (overwrite) this.goBack();
    }

    firebase.analytics().logEvent("Program_record_save");
  };

  getNextStepDur = () => {
    const { pump } = this.props;
    const { playStatus } = pump;
    const {
      newProgram, currentTime, carouselPosition
    } = pump.activeProgram;

    // If stopped, return this
    if (playStatus === constants.OP_STOP) return ("00:00");

    return moment.utc(
      (
        (newProgram.length > 0 ? newProgram[carouselPosition].duration : 0)
        - currentTime
      )
      * 1000
    ).format("mm:ss");
  };

  toggleMode = () => {
    const { pump } = this.props;
    const { mode } = pump;

    setMode(0, true);
    firebase.analytics().logEvent(`Program_toggled_to_${mode === LETDOWN ? "EXPRESSION" : "LETDOWN"}`);
  };

  changeVacCyc = () => {
    const { navigation, stopSezion } = this.props;

    this.setState({ showChangeVacCyc: false });

    const stopProgramPload = stopProgramPayload();

    stopSezion(stopProgramPload, true);

    firebase.analytics().logEvent("Change_Vac_Cyc_Program");

    navigation.pop();
    navigation.navigate("ManualRun", { type: "manual" });
  };

  onConfirmDelete = () => {
    const { pump, deleteProgram, navigation } = this.props;
    const { currentProgram, programs } = pump;

    this.setState({ deletingProgram: false });
    navigation.pop();
    setTimeout(() => { deleteProgram(currentProgram.id, programs); }, 500);
  };

  onDenyDelete = () => {
    this.setState({ deletingProgram: false });
  };

  onActionEdit = () => {
    const {
      pump, navigation, addMessage
    } = this.props;
    const {
      playStatus, activeProgram
    } = pump;
    const { playingProgram } = activeProgram;

    if (playingProgram && playStatus !== constants.OP_STOP) {
      addMessage(M.STOP_PLAY_PROGRAM);
      return;
    }

    navigation.pop();
    navigation.navigate("ProgramEdit", { action: null });
  };

  onSelectSyncProgram = (selectedSyncProgram) => {
    this.setState({
      selectedSyncProgram,
      shouldSync: false,
      shouldSyncConfirm: true
    });
  };

  onDenySync = () => this.setState({ shouldSync: false, shouldSyncConfirm: false });

  onConfirmedSync = () => {
    const { addMessage, pump } = this.props;
    const { currentProgram } = pump;
    const { selectedSyncProgram } = this.state;

    this.setState({ shouldSyncConfirm: false });
    sendProgramData({ ...currentProgram, id: selectedSyncProgram });
    firebase.analytics().logEvent("Program_synced_with_pump");
    setTimeout(() => addMessage(M.SYNC_COMPLETED), 700); // TODO: need better approach
  };

  shareProgramToPl = async ({ selectedTags, description }) => {
    const {
      addMessage, pump, auth
    } = this.props;
    const { currentProgram } = pump;

    this.setState({ showShareToPl: false });

    // Add pause steps
    const pauseObj = await getPauseObj(currentProgram);
    const pauseSteps = formatToAPIPauseSteps(currentProgram.id, pauseObj);

    const programBody = shareToPlBody(
      currentProgram,
      description,
      selectedTags,
      pauseSteps,
      auth.profile?.displayName
    );

    ApiProgram.uploadNewProgram(programBody).then(() => {
      addMessage(`${currentProgram.name} shared sucessfully to Pumpables Library`);
    }).catch((errorMessage) => {
      addMessage(errorMessage);
    });
  };

  onMoreModalSelected = (selection) => {
    const {
      pump, shareProgramWithFriends, addMessage,
      duplicateProgram
    } = this.props;
    const { showShareToPl } = this.state;
    const { currentProgram, pumpDeviceName } = pump;
    const { hasPauseStep } = pump.activeProgram;

    this.setState({ moreModalVisible: false });

    if (selection === 4) {
      setTimeout(() => this.setState({ deletingProgram: true }), 500);
    } else if (selection === 3) {
      setTimeout(() => this.onActionEdit(), 500);
    } else if (selection === 2) {
      getPauseObj(currentProgram).then((pauseObj) => {
        shareProgramWithFriends(currentProgram.id, currentProgram, pauseObj);
      });
    } else if (selection === 1) {
      if (!this.checkConnectStatus()) {
        addMessage(M.PUMP_DISCONNECT.replace("pump", pumpDeviceName));
        return;
      }

      if (hasPauseStep) {
        addMessage(M.SYNC_ERROR_PAUSE_STEP);
        return;
      }

      this.setState({
        shouldSync: true
      });
    } else if (selection === 5) {
      // Timeout needed to solve IOS display issue
      setTimeout(() => { this.setState({ showShareToPl: !showShareToPl }); }, 1000);
    } else if (selection === 6) {
      duplicateProgram(currentProgram.id);
    }
  };

  render() {
    const {
      navigation, pump, addMessage,
      updateChangedProgram,
    } = this.props;
    const {
      currentProgram, playStatus, programSeq,
      imageCard, cycleIndex, vacuumIndex,
      vacuumOptions, cycleOptions, mode,
      pumpDevice
    } = pump;
    const {
      carouselPosition, programAltered, newProgram,
      currentIndex, modeId, totalTime
    } = pump.activeProgram;
    const {
      showStopWarning, closeProgram, saveMessage,
      saveMessageIndex, showChangeVacCyc, moreModalVisible,
      deletingProgram, shouldSync, shouldSyncConfirm,
      selectedSyncProgram, showShareToPl, showMoreProgDesc
    } = this.state;

    let imageSource = null;

    if (imageCard[`programRunImage${currentProgram.id}`]) {
      imageSource = { uri: imageCard[`programRunImage${currentProgram.id}`] };
    } else {
      imageSource = currentProgram.pumpName === constants.PUMP_DEVICE.GG2
        ? Images.defaultGAProgram : Images.defaultSGProgram;
    }

    const programData = currentProgram.steps;

    const switchIcon = mode === EXPRESSION ? Images.blueOnShadow2x : Images.orangeOnShadow2x;

    return (
      <Container noScroll edges={["top"]}>
        <PumpStatusHeader />
        <Card
          title={currentProgram.name}
          type="programRunImage"
          label="Add Photo"
          showMoreButton
          moreActionEvent={() => this.setState({ moreModalVisible: true })}
          imageSource={imageSource}
          width="100%"
          height="27%"
          currentProgram={currentProgram}
          nav={navigation}
          programs={{}}
          event="Program_image_selection"
          onCancel={() => {
            if (programAltered && !closeProgram) {
              this.setState({ showStopWarning: true, closeProgram: true });
            } else {
              firebase.analytics().logEvent("Program_cancel");
              this.goBack();
            }
          }}
        />
        <View style={Styles.programStepInfoView}>
          <ProgramStepInfo
            data={newProgram}
            index={carouselPosition}
          />
        </View>
        <View style={Styles.ovalContainerOuterStyle}>
          <View style={Styles.ovalContainerStyle}>
            {/* <ButtonRound
              disabled
              onPress={() => { this.setState({ showChangeVacCyc: !showChangeVacCyc }); }}
              style={Styles.alterView}
            >
              <Text font12 weightSemiBold white>
                Change Vacuum/Cycle
              </Text>
            </ButtonRound> */}
            <View
              style={Styles.programNameView}
            >
              <ScrollView>
                <Text
                  style={Styles.programName}
                  maxFontSizeMultiplier={1}
                >
                  {currentProgram.name}
                </Text>
              </ScrollView>
              {/* <Image
                style={Styles.modeMiniImage}
                source={modeId === LETDOWN ? Images.letdownMini : Images.expressionMini}
              /> */}
            </View>
            {
              programAltered
                ? (
                  <View style={[Styles.statusTextView]}>
                    <View style={Styles.redBall} />
                    <Text font11 weightBold>Recording...</Text>
                  </View>
                )
                : <View />
            }
            {currentProgram.description ? (
              <TextMoreBox
                text={currentProgram.description}
                maxLenNum={2}
                openMoreText={() => this.setState({ showMoreProgDesc: true })}
              />
            ) : <View />}
            {currentProgram.tags && (
              <View style={Styles.pumpingTags}>
                {currentProgram.tags.map((tag) => {
                  const thisTag = constants.PUMPING_TAGS.find((item) => item.id === tag);
                  return (
                    <PumpingTag
                      key={tag}
                      id={tag}
                      label={thisTag.label}
                      viewStyle={Styles.tagView}
                    />
                  );
                })}
              </View>
            )}
            <View style={Styles.modeView}>
              <Image
                source={modeId === LETDOWN ? Images.letdownMini : Images.expressionMini}
                style={Styles.modeImage}
              />
              <Text style={Styles.modeText} maxFontSizeMultiplier={1.1} white>
                {modeId === LETDOWN ? "LETDOWN" : "EXPRESSION"}
              </Text>
            </View>
            <View style={Styles.dataContainer}>
              <View style={Styles.infoView}>
                <InfoLabel
                  title="TOTAL TIME"
                  value={moment.utc(totalTime * 1000).format("mm:ss")}
                  style={{}}
                />
                <InfoLabel
                  title="NEXT STEP"
                  value={this.getNextStepDur()}
                  style={Styles.nextStepView}
                />
              </View>
            </View>
            {
              isGen2Pump(pumpDevice) && (
                <TouchableOpacity
                  onPress={() => this.toggleMode()}
                  style={Styles.toggle}
                >
                  <Image
                    resizeMode="contain"
                    source={switchIcon}
                    style={{ width: size(62), height: size(44) }}
                  />
                </TouchableOpacity>
              )
            }
            <PumpControl
              speed={(programAltered || isGen2Pump(pumpDevice))
                ? (newProgram[currentIndex]
                  ? newProgram[currentIndex].cycle : constants.EMPTY_SESSION.cycle)
                : programData[programSeq].cycle}
              strength={(programAltered || isGen2Pump(pumpDevice))
                ? (newProgram[currentIndex]
                  ? newProgram[currentIndex].vacuum : constants.EMPTY_SESSION.vacuum)
                : programData[programSeq].vacuum}
              onCancel={() => {
                firebase.analytics().logEvent("Program_cancel");
                this.goBack();
              }}
              onPlay={this.playSession}
              onPause={this.pauseSession}
              onStop={this.stopSession}
              playStatus={playStatus}
              onValueChange={(type, index, increment) => this.onValueChange(type, index, increment)}
              options={{ vacuum: vacuumOptions, cycle: cycleOptions }}
              index={{ vacuum: vacuumIndex, cycle: cycleIndex }}
              warnMsg={(msg) => addMessage(msg)}
              hideVcCc={!isGen2Pump(pumpDevice)}
              hideControlLabel
            />
          </View>
        </View>
        {showChangeVacCyc && (
          <ConfirmationToast
            title="This option will:"
            subtitle={
              "- Exit program & keep pumping in manual mode\n- Not save changes to this step (only doable via Edit Program)"
            }
            option1="Cancel"
            option2="Ok"
            onPressDeny={() => {
              this.setState({ showChangeVacCyc: false });
            }}
            onPressConfirm={this.changeVacCyc}
          />
        )}
        {showStopWarning && (
          <ConfirmationToast
            title={saveMessage[saveMessageIndex].title}
            subtitle={saveMessage[saveMessageIndex].subtitle}
            option1={saveMessage[saveMessageIndex].option1}
            option2={saveMessage[saveMessageIndex].option2}
            onPressConfirm={() => {
              if (saveMessageIndex === 0) {
                this.setState(
                  { showStopWarning: false },
                  () => {
                    this.setState({ showStopWarning: true, saveMessageIndex: 1 });
                  }
                );
              } else if (saveMessageIndex === 1) {
                this.save();

                updateChangedProgram({
                  stoppedSessionRec: false,
                  programAltered: false
                });
              }
            }}
            onPressDeny={() => {
              if (saveMessageIndex === 0) {
                updateChangedProgram({
                  stoppedSessionRec: false,
                  programAltered: false
                });

                this.setState({
                  showStopWarning: false
                });

                if (!closeProgram) {
                  this.playSession();
                } else {
                  this.goBack();
                }
              } else if (saveMessageIndex === 1) {
                this.save(false);

                updateChangedProgram({
                  stoppedSessionRec: false,
                  programAltered: false
                });

                this.setState({
                  showStopWarning: false,
                });

                if (!closeProgram) {
                  // this.playSession(); Reset entire thing
                } else {
                  this.goBack();
                }
              }
            }}
          />
        )}
        {showMoreProgDesc && (
          <InfoModal
            title="Decription"
            subtitle={currentProgram.description}
            onPressClose={() => this.setState({ showMoreProgDesc: false })}
          />
        )}
        {deletingProgram && (
          <ConfirmationToast
            title=""
            subtitle={`Are you sure you want to delete ${currentProgram.name}?`}
            onPressConfirm={this.onConfirmDelete}
            onPressDeny={this.onDenyDelete}
          />
        )}
        {shouldSync && (
          <ConfirmationToast
            isSyncProgramModal
            title={M.CONFIRM_SYNC_PROGRAM_PUMP}
            onPressConfirm={this.onSelectSyncProgram}
            onPressDeny={this.onDenySync}
          />
        )}
        {shouldSyncConfirm && (
          <ConfirmationToast
            title=""
            subtitle={`Are you sure you want to set this program as P${selectedSyncProgram} on SuperGenie? This will overwrite any program recorded on your pump as P${selectedSyncProgram}.`}
            onPressConfirm={this.onConfirmedSync}
            onPressDeny={this.onDenySync}
          />
        )}
        {showShareToPl && (
          <PlShareModal
            title={currentProgram.name}
            programDescription={currentProgram.description}
            preSelectedTags={currentProgram.tags}
            isVisible={showShareToPl}
            onPressConfirm={this.shareProgramToPl}
            onPressDeny={() => this.setState({ showShareToPl: false })}
          />
        )}
        {moreModalVisible && (
          <SelectionModal
            isVisible={moreModalVisible}
            title=""
            onPressConfirm={this.onMoreModalSelected}
            dataArr={formatProgramSelectionData(currentProgram, constants.programMoreSelectionData)}
          />
        )}
      </Container>
    );
  }
}

ProgramRun.propTypes = {
  navigation: PropTypes.object,
  pump: PropTypes.object,
  status: PropTypes.object,
  auth: PropTypes.object,
  setUpProgram: PropTypes.func,
  cleanProgramUnmount: PropTypes.func,
  splitProgramStep: PropTypes.func,
  setCycleIndex: PropTypes.func,
  setVacuumIndex: PropTypes.func,
  addMessage: PropTypes.func,
  startProgram: PropTypes.func,
  resumeProgram: PropTypes.func,
  updateProgramState: PropTypes.func,
  pauseSezion: PropTypes.func,
  stopSezion: PropTypes.func,
  saveChangedProgram: PropTypes.func,
  updateChangedProgram: PropTypes.func,
  deleteProgram: PropTypes.func,
  shareProgramWithFriends: PropTypes.func,
  duplicateProgram: PropTypes.func,
  playWantedToProgram: PropTypes.func,
  showTimerButton: PropTypes.func,
  showButton: PropTypes.string
};

const mapStateToProps = ({
  pump, auth, status, session
}) => {
  return {
    pump,
    auth,
    status,
    showButton: session.showButton
  };
};

const mapDispatchToProps = {
  addMessage,
  setUpProgram,
  startProgram,
  resumeProgram,
  stopSezion,
  updateProgramState,
  pauseSezion,
  setCycleIndex,
  setVacuumIndex,
  splitProgramStep,
  updateChangedProgram,
  saveChangedProgram,
  resetLog: reset,
  sessionStart: start,
  cleanProgramUnmount,
  deleteProgram,
  shareProgramWithFriends,
  duplicateProgram,
  playWantedToProgram,
  showTimerButton
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgramRun);

const Styles = {
  programStepInfoView: {
    marginTop: "-15%",
    alignItems: "center"
  },
  pumpingTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 5
  },
  tagView: {
    height: 25,
    borderRadius: 5
  },
  alterView: {
    backgroundColor: "transparent",
    alignSelf: "center"
  },
  infoView: {
    width: "100%",
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between"
  },
  nextStepView: {},
  modeView: {
    backgroundColor: Colors.lightBlue,
    paddingHorizontal: 3,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    height: 30,
    marginTop: 5
  },
  modeImage: {
    height: 20,
    width: 15,
    marginRight: 5
  },
  modeText: {
    marginTop: 3
  },
  carouselNavIcon: {
    width: 32,
    height: 32
  },
  programNameView: {
    width: "100%",
    maxHeight: 55,
    marginBottom: 3
  },
  programName: {
    width: "100%",
    padding: 0,
    marginTop: 2,
    marginBottom: 3,
    backgroundColor: "transparent",
    fontSize: 20,
    fontWeight: "700",
    color: Colors.grey,
    textAlign: "center"
  },
  statusTextView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5
  },
  toggle: {
    position: "absolute",
    bottom: 0,
    left: 0,
    marginLeft: 20,
    marginBottom: "24%",
    zIndex: 10000
  },
  carouselBtnLeft: {
    position: "absolute",
    height: "3%",
    justifyContent: "center",
    marginLeft: 5,
    marginTop: "35%",
  },
  carouselBtnRight: {
    position: "absolute",
    height: "3%",
    right: 0,
    justifyContent: "center",
    marginRight: 5,
    marginTop: "35%",
  },
  redBall: {
    backgroundColor: Colors.brightRed,
    borderRadius: 100,
    height: 8,
    width: 8,
    marginRight: 10,
  },
  saveButton: {
    width: 80,
    height: 40,
    textAlign: "center",
    zIndex: 6,
    position: "absolute",
    bottom: 0,
    marginBottom: 10,
    marginLeft: "5%"
  },
  carouselContainer: {
    marginTop: 15,
    height: "45%",
  },
  p15: {
    paddingLeft: 10,
    paddingRight: 5
  },
  headerIcon: {
    marginRight: 10
  },
  ovalContainerOuterStyle: {
    width: "100%",
    backgroundColor: Colors.white,
    marginTop: 5
  },
  ovalContainerStyle: {
    alignItems: "center",
    alignSelf: "center",
    width: "75%",
    height: "100%"
  },
  dataContainer: {
    flexDirection: "row",
    width: "100%"
  },
  editButtonContainer: {
    width: "45%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    width: 90,
    height: 30,
    borderColor: Colors.blue,
    paddingHorizontal: 5,
    alignSelf: "center",
  }
};
