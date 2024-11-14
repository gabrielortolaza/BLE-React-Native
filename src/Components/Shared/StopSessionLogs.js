import React, { Component } from "react";
import { Platform, View } from "react-native";
import { connect } from "react-redux";
import firebase from "@react-native-firebase/app";
import { PropTypes } from "prop-types";

import {
  showReviewModal, save, addMessage,
  hideToast
} from "../../Actions";
import {
  reset, showTimerButton, start,
  validateSession
} from "../../Actions/Session";
import { readProgramData, stopTrackingLocation, stopForegroundService } from "../../Actions/Pump";
import * as constants from "../../Config/constants";
import * as M from "../../Config/messages";
import ConfirmationToast from "./ConfirmationToast";
import * as RootNavigation from "../../App/RootNavigation";
import { checkIfToDisplayPlReviewModal, isGen2Pump } from "../../Services/SharedFunctions";
import { MANUAL_SESSION, PUMP_SESSION } from "../../Config/Analytics";

class StopSessionLogs extends Component {
  constructor(props) {
    super(props);

    this.state = {
      askToSaveSession: false
    };
  }

  componentDidUpdate(prevProps) {
    const {
      pump, stopTrackingLocation, showTimerButton,
      showReviewModal, session, sessionSave,
      addMessage
    } = this.props;
    const { breastType } = session;
    const {
      playStatus, pumpDevice, watchingLocation,
      currentProgram
    } = pump;
    const { startedProgramAt, endedProgramAt } = pump.activeProgram;

    if (
      playStatus === constants.OP_STOP
      && playStatus !== prevProps.pump.playStatus
      && (
        prevProps.pump.playStatus === constants.OP_START
          || prevProps.pump.playStatus === constants.OP_PAUSE
      ) // Handle gibberish from disconnection
      && startedProgramAt
    ) {
      showTimerButton(null);

      checkIfToDisplayPlReviewModal(currentProgram)
        .then((val) => {
          const { uid } = firebase.auth().currentUser;

          const data = {
            status: constants.SESSION_EDITING,
            duration: 0,
            actionType: constants.SESSION_ACTION_TYPE_MANUAL,
            key: null,
            startedAt: startedProgramAt,
            finishedAt: endedProgramAt,
            sessionType: constants.SESSION_TYPE_PUMP,
            notes: null,
            volume: 0,
            breastType,
            uid,
            volumeBreastSideLeft: 0,
            volumeBreastSideRight: 0,
            sessionKind: constants.SESSION_KIND_MANUAL,
            createdAt: null,
            programId: currentProgram.createdId
          };

          // Save log of pumped session
          validateSession(data)
            .then((x) => {
              sessionSave(uid, x, true);

              const toastParams = {
                showCTAButtons: true,
                confirmText: "Edit",
                onPressConfirm: () => {
                  hideToast();
                  RootNavigation.navigate(
                    "SessionModal",
                    {
                      editAutoPumpSession: true,
                      programName: currentProgram.createdId ? currentProgram.name : "No program"
                    }
                  );
                },
              };

              addMessage(
                M.AUTO_PUMP_LOG_SUCCESS,
                toastParams
              );

              firebase.analytics().logEvent(PUMP_SESSION, {
                type: MANUAL_SESSION,
                newSession: true
              });

              if (val) {
                setTimeout(() => {
                  showReviewModal(true);
                }, 1000);
              }
            })
            .catch((x) => console.error(M.VALIDATE_SESSION_ERROR, x));
        });

      if (isGen2Pump(pumpDevice)) {
        setTimeout(() => {
          readProgramData();
        }, 3000); // Time for pump firmware to finalise modified program
      }

      if (watchingLocation) {
        stopTrackingLocation();
      }

      if (Platform.OS === "android") {
        stopForegroundService();
      }
    }
  }

  render() {
    const {
      pump, sessionStart, resetLog
    } = this.props;
    const { startedProgramAt, endedProgramAt } = pump.activeProgram;
    const { askToSaveSession } = this.state;

    return (
      <View>
        { askToSaveSession && (
          <ConfirmationToast
            title={M.ADD_SESSION_TO_LOG}
            subtitle=""
            onPressDeny={() => {
              this.setState({ askToSaveSession: false });
            }}
            onPressConfirm={() => {
              const data = { startedAt: startedProgramAt, finishedAt: endedProgramAt };
              resetLog(data);
              sessionStart("manual", "pump", data);
              this.setState({ askToSaveSession: false });
              setTimeout(() => {
                // Allow Manual/Program screens to navigate first
                RootNavigation.navigate("SessionModal", { actionType: "manual", newSession: true });
              }, 1000);
            }}
          />
        )}
      </View>
    );
  }
}

StopSessionLogs.propTypes = {
  pump: PropTypes.object,
  session: PropTypes.object,
  resetLog: PropTypes.func,
  sessionStart: PropTypes.func,
  stopTrackingLocation: PropTypes.func,
  showTimerButton: PropTypes.func,
  showReviewModal: PropTypes.func,
  sessionSave: PropTypes.func,
  addMessage: PropTypes.func
};

const mapStateToProps = ({
  pump, session
}) => {
  return {
    pump,
    session
  };
};

const mapDispatchToProps = {
  resetLog: reset,
  sessionStart: start,
  stopTrackingLocation,
  showTimerButton,
  showReviewModal,
  sessionSave: save,
  addMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(StopSessionLogs);
