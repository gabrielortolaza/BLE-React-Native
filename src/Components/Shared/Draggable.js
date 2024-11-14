import React, { Component } from "react";
import {
  StyleSheet, View, PanResponder,
  Animated, TouchableOpacity
} from "react-native";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import moment from "moment";
import firebase from "@react-native-firebase/app";
import ReactTimeout from "react-timeout";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import branch from "react-native-branch";

import * as RootNavigation from "../../App/RootNavigation";
import {
  showTimerButton, addMessage, importProgram,
  resumeProgram, pauseSession, stopTimer,
  stopSession, startSession
} from "../../Actions";
import { pause, stop, resume } from "../../Actions/Session";
import { Colors } from "../../Themes";
import TimeTicker from "./TimeTicker";
import {
  LOG_TIMER, MANUAL_TIMER, OP_START, PROGRAM_TIMER,
  SESSION_RUNNING, CONNECT_STATUS
} from "../../Config/constants";
import Label from "./Label";
import Icon from "./Icon";
import { IN_PAUSE_STEP } from "../../Config/messages";
import { stopProgramPayload } from "../../Services/SharedFunctions";

const TimeTickerWithTimeout = ReactTimeout(TimeTicker);

class Draggable extends Component {
  constructor() {
    super();
    this.state = {
      pan: new Animated.ValueXY()
    };

    const { pan } = this.state;
    let panXTouchStart = 0;

    // Add a listener for the delta value change
    this._val = { x: 0, y: 0 };
    pan.addListener((value) => {
      this._val = value;
    });
    // Initialize PanResponder with move handling
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset(pan.__getValue());
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, {
          dx: pan.x,
          dy: pan.y
        }],
        { useNativeDriver: false }
      ),
      onPanResponderStart: () => {
        panXTouchStart = pan.x._value;
      },
      onPanResponderRelease: () => {
        const movedX = Math.abs(panXTouchStart - pan.x._value);
        if (movedX < 2) {
          this.goBackToPage();
        }
      }
    });
  }

  componentDidMount() {
    const { importProgram } = this.props;

    // Firebase dynamic links
    this.unsubscribeDynamicLink = dynamicLinks().onLink(this.handleDynamicLink);

    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        console.log("Got background dynamic link:", link);
        link && importProgram(link.url, RootNavigation);
      });

    // Branch links
    branch.subscribe({
      onOpenComplete: ({
        error,
        params,
        uri
      }) => {
        if (error) {
          console.error(`Subscribe onOpenComplete error from opening uri: ${uri}`, error);
          return;
        }
        if (params) {
          if (!params["+clicked_branch_link"]) {
            if (params["+non_branch_link"]) {
              console.log(`non_branch_link, returning: ${uri}`);
              // Route based on non-Branch links
              return;
            }
          }
          // Handle params
          // CB: const deepLinkPath = params.$deeplink_path;
          // CB: const canonicalUrl = params.$canonical_url;
          // Route based on Branch link data
          console.log("branch params:", params);
          this.handleDynamicLink(params.link, true);
        }
      },
    });
  }

  componentDidUpdate(prevProps) {
    const { showButton } = this.props;
    const { pan } = this.state;

    if (!showButton && (showButton !== prevProps.showButton)) {
      // Reset back to start position when hidden
      Animated.timing(pan, {
        toValue: { x: 0, y: 0 },
        duration: 100,
        useNativeDriver: false
      }).start();
    }

    if (showButton && (showButton !== prevProps.showButton)) {
      setTimeout(() => {
        this.shake();
      }, 800);
    }
  }

  componentWillUnmount() {
    this.unsubscribeDynamicLink();
  }

  handleDynamicLink = (link, isBranchLink) => {
    const { importProgram } = this.props;

    console.log(`Got ${isBranchLink ? "branch" : "foreground dynamic"} link:`, link);
    link && importProgram(
      isBranchLink ? link : link.url,
      RootNavigation
    );
  };

  shake = () => {
    const { pan } = this.state;

    Animated.timing(pan, {
      toValue: { x: -10, y: -5 },
      duration: 750,
      useNativeDriver: false
    }).start();

    setTimeout(() => {
      Animated.timing(pan, {
        toValue: { x: 0, y: 0 },
        duration: 750,
        useNativeDriver: false
      }).start();
    }, 750);
  };

  goBackToPage = () => {
    const { showButton, showTimerButton } = this.props;

    if (showButton === LOG_TIMER) {
      RootNavigation.navigate("SessionModal", { actionType: "record" });
      showTimerButton(null);
    } else if (showButton === PROGRAM_TIMER) {
      RootNavigation.navigate("ProgramRun");
      showTimerButton(null);
    } else if (showButton === MANUAL_TIMER) {
      RootNavigation.navigate("ManualRun", { type: "draggable" });
      showTimerButton(null);
    }
  };

  onPlayPause = () => {
    const {
      showButton, status, sessionResume,
      pump, addMessage, resumeProgram,
      pauseSession, startSession
    } = this.props;
    const {
      activeProgram, playStatus, speed,
      strength, mode, connectStatus
    } = pump;
    const { inPauseSeq, timer } = activeProgram;

    if (connectStatus !== CONNECT_STATUS.CONNECTED) {
      return; // Most likely during disconnection
    }

    if (showButton === LOG_TIMER) {
      const isRunning = status === SESSION_RUNNING;

      if (isRunning) {
        const {
          sessionPause, status, duration,
          resumedAt
        } = this.props;

        sessionPause(status, duration, resumedAt);
      } else {
        sessionResume(status);
      }
    } else if (showButton === PROGRAM_TIMER) {
      if (inPauseSeq) {
        addMessage(IN_PAUSE_STEP);
        return;
      }

      if (playStatus === OP_START) {
        stopTimer();
        pauseSession();

        firebase.analytics().logEvent("Program_pause");
      } else {
        resumeProgram(timer);
      }
    } else if (showButton === MANUAL_TIMER) {
      if (playStatus === OP_START) {
        stopTimer();
        pauseSession(null);

        firebase.analytics().logEvent("Manual_pause");
      } else {
        startSession(speed, strength, mode);
      }
    }
  };

  onStop = () => {
    const {
      sessionStop, status, duration,
      resumedAt, showButton, stopSession,
      showTimerButton, pump
    } = this.props;
    const { connectStatus } = pump;

    if (connectStatus !== CONNECT_STATUS.CONNECTED) {
      return; // Most likely during disconnection
    }

    if (showButton === LOG_TIMER) {
      sessionStop(status, duration, resumedAt);
      this.goBackToPage();
    } else if (showButton === PROGRAM_TIMER) {
      stopTimer();

      const stopProgramPload = stopProgramPayload();
      stopSession(stopProgramPload);

      showTimerButton(null);

      firebase.analytics().logEvent("Program_stop");
    } else if (showButton === MANUAL_TIMER) {
      stopTimer();

      stopSession({
        timer: null,
        totalTime: 0
      });

      showTimerButton(null);
    }
  };

  render() {
    const {
      showButton, resumedAt, status,
      duration, programTotalTime, pump
    } = this.props;
    const { playStatus } = pump;
    const { pan } = this.state;

    const panStyle = {
      transform: pan.getTranslateTransform()
    };

    const isRunning = status === SESSION_RUNNING;

    if (showButton) {
      return (
        <Animated.View
          {...this.panResponder.panHandlers}
          style={[panStyle, styles.box]}
        >
          <View>
            <Label
              blue
              font20
              weightBold
              maxFontSizeMultiplier={1.2}
              style={{ alignSelf: "center", marginTop: 3 }}
            >
              {showButton ? showButton.substr(0, 1).toUpperCase() : ""}
            </Label>
            <View
              style={styles.timerView}
            >
              {(showButton !== LOG_TIMER) ? (
                <Label
                  blue
                  font14
                  weightBold
                  maxFontSizeMultiplier={1.2}
                >
                  {moment.utc(programTotalTime * 1000).format("mm:ss") || "00:00"}
                </Label>
              ) : (
                <TimeTickerWithTimeout
                  resumedAt={resumedAt}
                  status={status}
                  duration={duration}
                  textStyle={{ fontSize: 14, color: Colors.blue }}
                />
              )}
            </View>
            <View
              style={styles.controlView}
            >
              <TouchableOpacity
                onPress={this.onPlayPause}
              >
                <Icon
                  name={showButton === LOG_TIMER ? isRunning ? "pause-circle" : "play-circle"
                    : playStatus === OP_START ? "pause-circle" : "play-circle"}
                  style={styles.playIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.onStop}
              >
                <Icon
                  name="stop-circle"
                  style={styles.stopIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      );
    }

    return <View />;
  }
}

let styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#F4F6F8",
    position: "absolute",
    right: 0,
    bottom: 0,
    marginRight: 10,
    marginBottom: 100,
    zIndex: 10000
  },
  controlView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5
  },
  timerView: {
    alignSelf: "center"
  },
  playIcon: {
    color: Colors.blue,
    fontSize: 20,
    marginLeft: 5
  },
  stopIcon: {
    color: "#EF5A5A",
    fontSize: 20,
    marginRight: 5,
    marginLeft: 20
  }
});

Draggable.propTypes = {
  showTimerButton: PropTypes.func,
  status: PropTypes.number,
  showButton: PropTypes.string,
  resumedAt: PropTypes.number,
  duration: PropTypes.number,
  addMessage: PropTypes.func,
  importProgram: PropTypes.func,
  pump: PropTypes.object,
  programTotalTime: PropTypes.number,
  sessionPause: PropTypes.func,
  sessionStop: PropTypes.func,
  sessionResume: PropTypes.func,
  resumeProgram: PropTypes.func,
  pauseSession: PropTypes.func,
  stopSession: PropTypes.func,
  startSession: PropTypes.func
};

const mapStateToProps = ({ session, pump }) => {
  const {
    showButton, resumedAt, status,
    duration
  } = session;

  return {
    showButton,
    resumedAt,
    status,
    duration,
    pump,
    programTotalTime: pump.activeProgram.totalTime
  };
};

const mapDispatchToProps = {
  showTimerButton,
  addMessage,
  importProgram,
  sessionPause: pause,
  sessionStop: stop,
  sessionResume: resume,
  resumeProgram,
  pauseSession,
  stopSession,
  startSession
};

export default connect(mapStateToProps, mapDispatchToProps)(Draggable);
