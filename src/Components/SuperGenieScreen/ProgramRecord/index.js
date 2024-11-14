/** Page appears to no longer be used */
/* eslint-disable */
// COMBAK: Remove page and from BaseNavigator
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View, Dimensions, Image, TouchableOpacity
} from "react-native";
import firebase from "@react-native-firebase/app";
import { connect } from "react-redux";
import Carousel from "react-native-reanimated-carousel";

import { AppHeader, Label } from "../../Shared";
import ProgramRecordControls from "./ProgramRecordControls";
import ProgramRecordCard from "./ProgramRecordCard";
import ProgramRecordWelcome from "./ProgramRecordWelcome";

import {
  MODES,
  EXPRESSION,
  LETDOWN,
} from "../../../Config/Modes";
import * as constants from "../../../Config/constants";
import { Colors, Images } from "../../../Themes";

import { addMessage } from "../../../Actions/Status";
import {
  requestStatus, setMode, startSession, setCurrentProgram,
  pauseSession, stopSession, setAll, saveProgram,
  setCycle, setVacuum
} from "../../../Actions/Pump";
import Container from "../../Shared/Container";

const appWidth = Dimensions.get("window").width;
const appHeight = Dimensions.get("window").height;
const margin = appWidth < 360 ? 20 : 40;
const itemSpacing = appWidth - ((130 + margin) * 2);

class ProgramRecord extends Component {
  constructor(props) {
    super(props);

    this.state = {
      vacuum: null,
      cycle: null,
      alerted: false,
      modeId: LETDOWN,
      vacuumOptions: [],
      cycleOptions: [],
      vacuumIndex: 0,
      cycleIndex: 0,
      refresh: false,
    };

    this.previousCycle = {
      1: null,
      2: null
    };

    this.previousVacuum = {
      1: null,
      2: null
    };
  }

  componentDidMount() {
    const { pump } = this.props;
    const { mode, programId } = pump;
    requestStatus();

    const { modeId } = this.state;
    const modeConfig = MODES[modeId];

    if (modeId !== mode || programId !== 0) {
      setMode(modeId);
    }
    this.setState({
      vacuumOptions: modeConfig.vacuum[0],
      cycleOptions: modeConfig.cycle[0],
      title: modeConfig.title
    }, async () => {
      const { speed, strength } = pump;
      const { cycleOptions, vacuumOptions } = this.state;
      await this.setCycleIndex(cycleOptions.findIndex((c) => c === speed));
      await this.setVacuumIndex(vacuumOptions.findIndex((c) => c === strength));
    });
  }

  // eslint-disable-next-line camelcase
  async UNSAFE_componentWillReceiveProps(nextProps) {
    const { pump, addMessage, setCurrentProgram } = this.props;
    if (pump.mode !== nextProps.pump.mode
      || pump.speed !== nextProps.pump.speed
      || pump.strength !== nextProps.pump.strength) {
      const { pump } = nextProps;
      const {
        speed, mode, strength, playStatus
      } = pump;
      const {
        modeId, cycleIndex, cycleOptions, vacuumIndex, vacuumOptions,
        vacuum, cycle, refresh
      } = this.state;

      console.log(mode, "ProgramRecord_componentWillReceiveProps", modeId);

      if (mode !== modeId) {
        await this.toggleMode();
      }

      if (speed !== cycleOptions[cycleIndex]) {
        await this.setCycleIndex(cycleOptions.findIndex((c) => c === speed));
      }

      if (strength !== vacuumOptions[vacuumIndex]) {
        await this.setVacuumIndex(vacuumOptions.findIndex((c) => c === strength));
      }

      if (modeId === mode && vacuum === strength && cycle === speed) return;
      if (playStatus !== constants.OP_START) return;
      setTimeout(() => {
        if (pump.currentProgram.steps.length > 24) {
          addMessage("You can't save more than 25 steps in a program");
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
          this.setState({ refresh: !refresh });

          setTimeout(() => {
            if (this._carousel) {
              this._carousel.snapToItem(currentProgram.steps.length);
            }
          }, 750);
        });
      }, 500);
    }
  }

  watchParams = () => {
    const { pump } = this.props;
    const { mode, strength, speed } = pump;
    this.setState({
      modeId: mode,
      vacuum: strength,
      cycle: speed,
    });
  }

  // update duration of the last session
  updateDuration = () => {
    return new Promise((resolve) => {
      const { pump, setCurrentProgram } = this.props;
      const {
        currentProgram, mode, strength, speed
      } = pump;
      const { length } = currentProgram.steps;
      if (length < 1) return;
      console.log("get time:", this._control.getTime());
      currentProgram.steps[length - 1].duration = this._control.getTime();
      setCurrentProgram(currentProgram);
      this._control.resetTime();
      this.setState({
        modeId: mode,
        vacuum: strength,
        cycle: speed
      }, resolve);
    });
  }

  onRecord = () => {
    const { pump, startSession, setCurrentProgram } = this.props;
    const {
      currentProgram, mode, strength, speed, playStatus
    } = pump;
    const { modeId, vacuum, cycle } = this.state;
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
    this.watchParams(); // no need?

    if (playStatus !== constants.OP_START) startSession(speed, strength, mode);
  }

  onPause = () => {
    console.log("onPause");
    // if (this.watchDisposer) this.watchDisposer();
    pauseSession();
  }

  onSave = () => {
    firebase.analytics().logEvent("ProgramRecord_save");
    return this.updateDuration().then(() => {
      const {
        pump, navigation, saveProgram
      } = this.props;
      const {
        playStatus, currentProgram
      } = pump;

      // if (this.disposer) this.disposer();
      // if (this.watchDisposer) this.watchDisposer();
      if (playStatus !== constants.OP_STOP) stopSession();
      saveProgram(currentProgram.id, currentProgram);
      navigation.goBack();
    });
  }

  onCancel = () => {
    const {
      pump, addMessage, navigation
    } = this.props;
    const {
      currentProgram, playStatus
    } = pump;
    const { alerted } = this.state;
    if (currentProgram.steps && currentProgram.steps.length > 0 && !alerted) {
      addMessage("Are you sure you want to go back without saving?");
      this.setState({ alerted: true });
    } else {
      // if (this.disposer) this.disposer();
      // if (this.watchDisposer) this.watchDisposer();
      if (playStatus !== constants.OP_STOP) stopSession();
      navigation.goBack();
    }
  }

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
  }

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
  }

  toggleMode = () => {
    const { pump } = this.props;
    const { mode, strength } = pump;

    if (!strength) return; // Strength value not yet initialised

    const modeId = this.state.modeId === EXPRESSION ? LETDOWN : EXPRESSION;

    const vacuumOptions = MODES[modeId].vacuum[0];
    const cycleOptions = MODES[modeId].cycle[0];
    const { title } = MODES[modeId];
    if (mode !== modeId) {
      setAll(
        this.previousCycle[modeId] || cycleOptions[0],
        this.previousVacuum[modeId] || vacuumOptions[0],
        modeId
      );
    }

    firebase.analytics().logEvent(`ProgramRecord_toggled_to_${modeId === LETDOWN ? "LETDOWN" : "EXPRESSION"}`);

    return new Promise((resolve) => {
      this.setState({
        vacuumOptions,
        cycleOptions,
        title,
        modeId,
      }, resolve);
    });
  }

  onValueChange = (name, index) => {
    const { pump } = this.props;
    const {
      speed, strength, mode
    } = pump;
    const { vacuumOptions, cycleOptions } = this.state;

    if (name === "cycleStep") {
      this.setCycleIndex(index);
      if (speed !== cycleOptions[index]) {
        const cycle = cycleOptions[index];
        setCycle(cycle);
        this.previousCycle[mode] = cycle;
      }
    } else {
      this.setVacuumIndex(index);
      if (strength !== vacuumOptions[index]) {
        const vacuum = vacuumOptions[index];
        setVacuum(vacuum);
        this.previousVacuum[mode] = vacuum;
      }
    }
  }

  render() {
    const { pump, addMessage } = this.props;
    const {
      currentProgram,
      playStatus,
      speed,
      strength,
    } = pump;

    const {
      vacuumOptions,
      cycleOptions,
      modeId,
      vacuumIndex,
      cycleIndex,
      refresh
    } = this.state;

    const switchIcon = modeId === EXPRESSION ? Images.blueOnShadow2x : Images.orangeOnShadow2x;
    let length;

    console.log("current program:::", currentProgram);
    if (currentProgram.steps) {
      length = currentProgram.steps.length;
    } else {
      length = 0;
    }
    return (
      <Container style={{ backgroundColor: Colors.lightGreen }}>
        <View style={Styles.programs}>
          <AppHeader leftActionEvent={this.onCancel} transparent showBackButton alt />
          <Label style={Styles.title}>
            Program
            {" "}
            {currentProgram.id}
          </Label>
          {
            currentProgram.steps && currentProgram.steps.length > 0
              ? (
                <Carousel
                  data={currentProgram.steps}
                  sliderWidth={appWidth}
                  activeSlideOffset={1}
                  extraData={refresh}
                  itemWidth={170 + itemSpacing}
                  enableMomentum
                  ref={(c) => { this._carousel = c; }}
                  activeSlideAlignment="center"
                  inactiveSlideScale={1}
                  inactiveSlideOpacity={1}
                  removeClippedSubviews={false}
                  renderItem={({ item, index }) => (
                    <View style={Styles.cardContainer}>
                      <ProgramRecordCard
                        programId={String(item.id)}
                        programData={item}
                        index={index + 1}
                        opacity={length !== index + 1}
                      />
                    </View>
                  )}
                />
              ) : <ProgramRecordWelcome />
          }
        </View>
        {/* <Trackpad
          verticalTitle="Vacuum"
          horizontalTitle="Cycle"
          speed={speed}
          strength={strength}
          showPumpInfo
          onPlay={() => {
            firebase.analytics().logEvent("ProgramRecord_play");
            this.onRecord();
          }}
          onStop={() => {
            firebase.analytics().logEvent("ProgramRecord_stop");
            stopSession();
          }}
          onPause={() => {
            firebase.analytics().logEvent("ProgramRecord_pause");
            this.onPause();
          }}
          playStatus={playStatus}
          onValueChange={(type, index) => this.onValueChange(type, index)}
          options={{ vacuum: vacuumOptions, cycle: cycleOptions }}
          index={{ vacuum: vacuumIndex, cycle: cycleIndex }}
          maxOptions={{ vacuum: MODES[modeId].vacuum[0], cycle: MODES[modeId].cycle[0] }}
          warnMsg={(msg) => addMessage(msg)}
          event="Program_record"
        /> */}
        <TouchableOpacity
          style={{
            zIndex: 6, position: "absolute", bottom: appHeight * 0.16, marginLeft: "4%"
          }}
          onPress={() => this.toggleMode()}
        >
          <Image
            resizeMode="contain"
            source={switchIcon}
            style={{ width: 84, height: 60 }}
          />
        </TouchableOpacity>
        <ProgramRecordControls
          onSave={this.onSave}
          onCancel={this.onCancel}
          canSave={currentProgram && currentProgram.steps.length > 0}
          playStatus={playStatus}
          ref={(c) => { this._control = c; }}
        />
      </Container>
    );
  }
}

ProgramRecord.propTypes = {
  navigation: PropTypes.object,
  pump: PropTypes.object,
  addMessage: PropTypes.func,
  startSession: PropTypes.func,
  saveProgram: PropTypes.func,
  setCurrentProgram: PropTypes.func,
};

const Styles = {
  programs: {
    height: "46%",
    // flex: 3,
    marginTop: 0
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    borderRadius: 6,
    textAlign: "center",
    color: "rgb(255,255,255)",
    marginBottom: 20
  },
  p15: {
    paddingLeft: 15,
    paddingRight: 15
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
};

const mapStateToProps = ({ pump }) => ({
  pump,
});

const mapDispatchToProps = {
  addMessage,
  startSession,
  saveProgram,
  setCurrentProgram,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgramRecord);
