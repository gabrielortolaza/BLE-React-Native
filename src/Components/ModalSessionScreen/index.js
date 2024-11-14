import React, { Component } from "react";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import PropTypes from "prop-types";

import {
  reset, setField, validateSession,
  resume, pause, stop,
  showTimerButton, start
} from "../../Actions/Session";
import { save, remove, saveStash } from "../../Actions";

import StyleSheet from "../../Proportional";

// import Settings from "./Settings";
import Recording from "./Recording";
import Editing from "./Editing";
import {
  NO_PROGRAM_VALUE, SESSION_FINISHED_AT, SESSION_STARTED_AT
} from "../../Config/constants";
import { Colors } from "../../Themes";
import Header from "../Shared/AppHeader/Header";
import SessionSwitcher from "./SessionSwitcher";

class SessionModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      programsSelect: []
    };
  }

  componentDidMount() {
    const { programs } = this.props;

    const programsSelect = [];

    programsSelect.push({
      label: "No program",
      value: NO_PROGRAM_VALUE
    });

    // eslint-disable-next-line no-unused-vars, no-restricted-syntax
    for (const key of Object.keys(programs)) {
      programsSelect.push({
        label: programs[key].name,
        value: programs[key].createdId
      });
    }

    this.setState({
      programsSelect
    });
  }

  onChange = (field, value) => {
    const { setField, startedAt, finishedAt } = this.props;

    if (field === "startedAtDate" || field === "startedAtTime") {
      setField(SESSION_STARTED_AT, moment(value).format("x") * 1, startedAt, finishedAt);
    } else if (field === SESSION_FINISHED_AT) {
      setField(SESSION_FINISHED_AT, moment(value).format("x") * 1, startedAt, finishedAt);
    } else {
      setField(field, value, startedAt, finishedAt);
    }
  };

  closeModal = () => {
    const { navigation, sessionReset } = this.props;

    navigation.goBack();
    sessionReset();
    // COMBAK: this.props.scheduleNextAchievement();
  };

  minimizeModal = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  render() {
    const {
      status, route, measureUnit, sessionType
    } = this.props;
    const { programsSelect } = this.state;

    const actionType = route.params && route.params.actionType;
    const newSession = route.params && route.params.newSession;
    const editAutoPumpSession = route.params && route.params.editAutoPumpSession;
    const programName = route.params && route.params.programName;
    // const isSettings = status === 0;
    const isRecording = status >= 0;
    const isEditing = status < 0;
    return (
      <SafeAreaView style={styles.container} forceInset={{ top: "always" }}>
        <Header
          leftActionText={isRecording ? "Record to Logs" : newSession ? "Add Logs" : "Edit Logs"}
          leftActionEvent={this.closeModal}
          renderRightAction={(isRecording || newSession) ? null : () => (
            <SessionSwitcher sessionType={sessionType} />
          )}
          showHeaderSeparator
        />
        {
          // isSettings && (
          //   <Settings
          //     {...this.props}
          //     actionType={actionType}
          //     closeModal={this.closeModal}
          //   />
          // )
        }
        {
          isRecording && (
            <Recording
              {...this.props}
              onChange={this.onChange}
              actionType={actionType}
              closeModal={this.closeModal}
              minimizeModal={this.minimizeModal}
              validateSession={validateSession}
              measureUnit={measureUnit}
            />
          )
        }
        {
          isEditing && (
            <Editing
              {...this.props}
              onChange={this.onChange}
              actionType={actionType}
              programName={programName}
              closeModal={this.closeModal}
              newSession={newSession}
              editAutoPumpSession={editAutoPumpSession}
              validateSession={validateSession}
              measureUnit={measureUnit}
              programsSelect={programsSelect}
            />
          )
        }
      </SafeAreaView>
    );
  }
}

SessionModal.propTypes = {
  finishedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  startedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  route: PropTypes.object,
  sessionType: PropTypes.string,
  sessionReset: PropTypes.func.isRequired,
  // scheduleNextAchievement: PropTypes.func.isRequired,
  setField: PropTypes.func.isRequired,
  status: PropTypes.number,
  navigation: PropTypes.object,
  measureUnit: PropTypes.string,
  programs: PropTypes.object
};

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  }
});

const mapStateToProps = ({
  session, logs, auth, pump
}) => {
  const {
    startedAt, finishedAt, volume,
    sessionType, notes, status,
    duration, key, resumedAt,
    breastType, volumeBreastSide, createdAt,
    showButton, programId
  } = session;

  const { measureUnit } = auth.profile;

  const { logsMap } = logs;

  const { programs } = pump;

  return {
    measureUnit,
    createdAt,
    startedAt,
    finishedAt,
    resumedAt,
    volume,
    volumeBreastSide,
    sessionType,
    notes,
    breastType,
    status,
    programId,
    duration,
    keey: key,
    logsMap,
    showButtonOfTimer: showButton,
    programs
  };
};

const mapDispatchToProps = {
  sessionSave: save,
  sessionReset: reset,
  setField,
  removeSession: remove,
  sessionResume: resume,
  sessionPause: pause,
  sessionStop: stop,
  showTimerButton,
  sessionStart: start,
  saveStash,
};

export default connect(mapStateToProps, mapDispatchToProps)(SessionModal);
