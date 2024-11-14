import React, { Component, PureComponent } from "react";
import PropTypes from "prop-types";
import {
  View, ImageBackground, Text,
  Keyboard, Platform, TextInput,
} from "react-native";
import { connect } from "react-redux";
import moment from "moment";

import { addMessage, setCurrentProgram, setCurrentSession } from "../../../Actions";
import {
  AppHeader, Label, SegmentInfo, SliderSpeed
} from "../../Shared";
import {
  MODES, EXPRESSION, LETDOWN,
  TIME_OPTIONS
} from "../../../Config/Modes";
import * as constants from "../../../Config/constants";
import { Colors } from "../../../Themes";
import ButtonRound from "../../Shared/ButtonRound";
import * as M from "../../../Config/messages";
import Styles from "./styles";
import Header from "../../Shared/AppHeader/Header";
import Container from "../../Shared/Container";

// const durationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const programSteps = [
  { name: "Letdown", key: constants.PROGRAM_STEPS.letdown },
  { name: "Expression", key: constants.PROGRAM_STEPS.expression },
  { name: "Pause", key: constants.PROGRAM_STEPS.pause },
];

class ProgramEditSession extends Component {
  constructor(props) {
    super(props);

    const {
      pageIndex, currentProgramSteps, editingStep,
      stepCycle, stepVacuum, stepPause,
      pumpTypeSelected
    } = props.route.params;

    const navPause = stepPause;
    this.state = {
      vacuumOptions: [],
      cycleOptions: [],
      keyboardActive: "3%",
      stepDuration: "",
      isPause: navPause || false,
      editingPause: navPause || false,
      pageIndex,
      currentProgramSteps: currentProgramSteps || [],
      editingStep,
      vcPrefix: pumpTypeSelected === constants.PUMP_DEVICE.GG2 ? "gg2_" : ""
    };

    console.log("Check:", this.state, JSON.stringify(props.pump.currentSession), props.pump.currentProgram);

    this.stepVacuum = stepVacuum || null;
    this.stepCycle = stepCycle || null;
  }

  componentDidMount() {
    const { pump, route } = this.props;
    const { currentSession } = pump;
    const { isPause } = this.state;

    const duration = TIME_OPTIONS[0].value;

    if (!isPause) {
      this.updateMode(currentSession.mode, false, currentSession.duration === 0 && (duration * 60));
    }

    if (currentSession.duration === 0) {
      this.setState({ stepDuration: duration });
    }

    if (Platform.OS === "ios") {
      this.keyboardWillShowListener = Keyboard.addListener("keyboardWillShow", () => {
        this.setState({ keyboardActive: "0%" });
      });
      this.keyboardWillHideListener = Keyboard.addListener("keyboardWillHide", () => {
        this.setState({ keyboardActive: "5%" });
      });
    }

    const paramsDur = `${route.params.stepDuration / 60}`;

    this.setState({ stepDuration: (paramsDur === "0" ? "1" : paramsDur) || "" });
  }

  componentWillUnmount() {
    if (Platform.OS === "ios") {
      this.keyboardWillShowListener.remove();
      this.keyboardWillHideListener.remove();
    }
  }

  updateMode = (modeId, overwrite = false, duration = false) => {
    const { pump, setCurrentSession } = this.props;
    const { currentSession } = pump;
    const { vcPrefix } = this.state;

    const vacuumOptions = MODES[modeId][`${vcPrefix}vacuum`][0];
    const cycleOptions = MODES[modeId][`${vcPrefix}cycle`][0];
    const hasVacuum = currentSession.vacuum;
    const hasCycle = currentSession.cycle;

    setCurrentSession({
      ...currentSession,
      vacuum: overwrite ? vacuumOptions[0] : (hasVacuum || vacuumOptions[0]),
      cycle: overwrite ? cycleOptions[0] : (hasCycle || cycleOptions[0]),
      mode: modeId,
      ...(duration && { duration })
    });
    this.setState({ vacuumOptions, cycleOptions });
  };

  updateSession = (key, value) => {
    const { pump, setCurrentSession } = this.props;
    const { currentSession } = pump;
    setCurrentSession({ ...currentSession, [key]: value });
  }

  setVacuum = (index) => {
    const { pump } = this.props;
    const { vacuumOptions, vcPrefix } = this.state;
    const { currentSession } = pump;

    this.updateSession("vacuum", vacuumOptions[index]);
    this.setState({
      cycleOptions: MODES[currentSession.mode][`${vcPrefix}cycle`][index],
    });
  }

  setCycle = (index) => {
    const { pump } = this.props;
    const { currentSession } = pump;
    const { cycleOptions, vcPrefix } = this.state;

    this.updateSession("cycle", cycleOptions[index]);
    this.setState({
      vacuumOptions: MODES[currentSession.mode][`${vcPrefix}vacuum`][index],
    });
  }

  // setDuration = (duration) => {
  //   duration += 1;
  //   this.setState({ stepDuration: duration });
  //   this.updateSession("duration", duration * 60);
  // }

  setMinDuration = (duration) => {
    const { stepDuration } = this.state;
    const sec = parseInt(moment.utc(stepDuration * 60 * 1000).format("s"), 10);

    console.log("Min dur:", duration);
    if (duration.length === 0) {
      duration = 0;
    }

    duration = parseInt(duration, 10) + (sec / 60);

    console.log("Min dur2:", duration);
    this.setState({ stepDuration: duration });
    this.updateSession("duration", duration * 60);
  }

  setSecDuration = (duration) => {
    const { stepDuration } = this.state;
    const min = parseInt(moment.utc(stepDuration * 60 * 1000).format("m"), 10);

    console.log("Sec dur:", duration);
    if (duration.length === 0) {
      duration = 0;
    }

    duration = (parseInt(duration, 10) / 60) + min;

    console.log("Sec dur2:", duration);
    this.setState({ stepDuration: duration });
    this.updateSession("duration", duration * 60);
  }

  saveSession = () => {
    const {
      pump, navigation, addMessage,
      setCurrentProgram
    } = this.props;
    const { currentSession, currentProgram } = pump;
    const { steps } = currentProgram;
    const {
      stepDuration, isPause, pageIndex,
      currentProgramSteps, editingStep
    } = this.state;

    if (pageIndex === 0 && isPause) {
      addMessage(M.NOT_PAUSE_STEP_AS_FIRST);
      return;
    }

    // If previous step is also a pause step
    if (pageIndex > 0 && currentProgramSteps[pageIndex - 1]) {
      if (isPause && currentProgramSteps[pageIndex - 1].pause) {
        addMessage(M.NOT_CONSECUTIVE_PAUSE_STEP);
        return;
      }
    }

    const currentSessIndex = currentSession.index;
    const { modifiedIndex } = currentSession;

    if (stepDuration && stepDuration !== "0" && stepDuration !== "0." && !isPause) {
      console.log("current+program", JSON.stringify(currentProgram));

      currentSession.duration = Number(stepDuration) * 60;

      if (currentProgramSteps[modifiedIndex] && currentProgramSteps[modifiedIndex].pause) {
        // If editing a pause step
        // Delete that pause step
        const { pauses } = currentProgram;

        delete pauses[modifiedIndex];
        delete currentSession.pause;
        console.log("Current:", currentSession, JSON.stringify(pauses));
        steps.splice(currentSessIndex, 0, currentSession);

        setCurrentProgram({
          ...currentProgram, steps: [...steps, constants.EMPTY_SESSION], pauses
        });
      } else {
        steps[currentSessIndex] = currentSession;
        setCurrentProgram({ ...currentProgram, steps: [...steps, constants.EMPTY_SESSION] });
      }
      navigation.goBack();
    } else if (stepDuration && stepDuration !== "0" && stepDuration !== "0." && isPause) {
      const { pauses } = currentProgram;

      const obj = {
        [modifiedIndex]: {
          duration: Number(stepDuration) * 60
        }
      };

      // If editing normal step
      let editingIndex = false;
      for (let i = 0; i < steps.length; i++) {
        if (steps[i] && steps[i].index === currentSessIndex) {
          editingIndex = i;
        }
      }

      console.log("editingIndex:", editingIndex, JSON.stringify(steps));

      if (editingIndex !== false && editingStep === "normal") {
        currentProgram.steps.splice(editingIndex, 1);
      }

      if (pauses && pauses.constructor === Object) {
        // Pause already exists in program
        pauses[modifiedIndex] = {
          duration: Number(stepDuration) * 60
        };

        console.log("Saving1:", pauses);
        setCurrentProgram({ ...currentProgram, pauses });
      } else {
        console.log("Saving2:", obj);
        setCurrentProgram({ ...currentProgram, pauses: obj });
      }
      navigation.goBack();
    } else {
      addMessage(M.FILL_DURATION_VALUE);
    }
  }

  segmentChange = (x) => {
    this.setState({ isPause: x === constants.PROGRAM_STEPS.pause });

    if (x === constants.PROGRAM_STEPS.letdown) {
      this.updateMode(LETDOWN, true);
    } else if (x === constants.PROGRAM_STEPS.expression) {
      this.updateMode(EXPRESSION, true);
    }
  }

  getActiveProgramStep = () => {
    const { pump } = this.props;
    const { currentSession } = pump;
    const { isPause } = this.state;

    if (isPause) {
      return constants.PROGRAM_STEPS.pause;
    }

    if (currentSession.mode === LETDOWN) {
      return constants.PROGRAM_STEPS.letdown;
    }

    if (currentSession.mode === EXPRESSION) {
      return constants.PROGRAM_STEPS.expression;
    }
  }

  render() {
    const { pump, navigation } = this.props;
    const { currentProgram } = pump;
    const {
      vacuumOptions, cycleOptions, keyboardActive,
      stepDuration, isPause
    } = this.state;

    // const durationSliderIndex = durationOptions.indexOf(parseInt(stepDuration, 10));

    const vacIndex = vacuumOptions.indexOf(this.stepVacuum);
    const cycIndex = cycleOptions.indexOf(this.stepCycle);

    console.log("Cprogram:", currentProgram, typeof stepDuration);

    return (
      <Container edges={["top"]}>
        <Header
          leftActionText="Add Step"
          leftActionEvent={navigation.goBack}
        />
        <SegmentInfo
          data={programSteps}
          onChange={this.segmentChange}
          active={this.getActiveProgramStep()}
          activeColor={Colors.lightBlue}
          inactiveColor={Colors.white}
          style={{ width: 100 }}
        />

        <View style={{ marginTop: keyboardActive }} />
        <View style={{ marginTop: keyboardActive }} />

        {!isPause && (
          <View>
            <Label font14 center grey weightBold mb10>Vacuum</Label>
            <SliderSpeed
              onValueChange={this.setVacuum}
              grey
              options={vacuumOptions}
              stepIndex={(vacuumOptions.length > 0 && vacIndex !== -1) ? vacIndex : 0}
            />

            <View style={[{ marginTop: keyboardActive }, Styles.viewDemarcation]} />
            <View style={{ marginTop: keyboardActive }} />

            <Label font14 center grey weightBold mb10>Cycle</Label>
            <SliderSpeed
              onValueChange={this.setCycle}
              grey
              options={cycleOptions}
              stepIndex={(cycleOptions.length > 0 && cycIndex !== -1) ? cycIndex : 0}
            />
          </View>
        )}

        <View style={[{ marginTop: keyboardActive }, Styles.viewDemarcation]} />
        <View style={{ marginTop: keyboardActive }} />
        <Label font14 center grey weightBold mb10>Duration</Label>
        {/* <SliderSpeed
          testID="program_edit_step_dur"
          onValueChange={this.setDuration}
          grey
          options={durationOptions}
          stepIndex={durationSliderIndex}
        /> */}

        <View style={{ marginTop: keyboardActive }} />
        <View style={{ marginTop: keyboardActive }} />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            height: 50
          }}
        >
          <View style={Styles.durationBox}>
            <TextInput
              keyboardType="numeric"
              maxLength={2}
              placeholder="mm"
              selectionColor={Colors.grey}
              style={Styles.textInput}
              underlineColorAndroid="transparent"
              value={moment.utc(stepDuration * 60 * 1000).format("m")}
              onChangeText={this.setMinDuration}
            />
            <Label font10>
              min
            </Label>
          </View>
          <View
            style={{
              height: "100%",
              justifyContent: "center"
            }}
          >
            <Text grey>:</Text>
          </View>
          <View style={Styles.durationBox}>
            <TextInput
              keyboardType="numeric"
              maxLength={2}
              placeholder="ss"
              selectionColor={Colors.grey}
              style={Styles.textInput}
              underlineColorAndroid="transparent"
              value={moment.utc(stepDuration * 60 * 1000).format("s")}
              onChangeText={this.setSecDuration}
            />
            <Label font10>
              sec
            </Label>
          </View>
        </View>

        <View style={{ marginTop: keyboardActive }} />
        <View style={{ marginTop: keyboardActive }} />

        <View style={Styles.doneButtonView}>
          <ButtonRound onPress={this.saveSession} blue style={Styles.doneButton}>
            <Label white font14 semiBold>Done</Label>
          </ButtonRound>
        </View>
        <View style={{ marginTop: keyboardActive }} />
        <View style={{ marginTop: keyboardActive }} />
      </Container>
    );
  }
}

const mapStateToProps = ({ pump }) => {
  return {
    pump
  };
};

const mapDispatchToProps = {
  addMessage,
  setCurrentProgram,
  setCurrentSession
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgramEditSession);

ProgramEditSession.propTypes = {
  pump: PropTypes.object,
  navigation: PropTypes.object,
  route: PropTypes.object,
  addMessage: PropTypes.func,
  setCurrentProgram: PropTypes.func,
  setCurrentSession: PropTypes.func
};

/** Component appears to no longer be used */
class Title extends PureComponent {
  render() {
    const { backgroundSource, children } = this.props;
    return (
      <ImageBackground
        source={backgroundSource}
        style={{ height: 190 }}
      >
        <AppHeader transparent />
        <View style={Styles.headerTitle}>
          <Label font30 white center weightSemiBold shadow>
            {children}
          </Label>
        </View>
      </ImageBackground>
    );
  }
}

Title.propTypes = {
  backgroundSource: PropTypes.any,
  children: PropTypes.string
};
