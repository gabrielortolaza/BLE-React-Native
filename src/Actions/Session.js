/* eslint-disable prefer-template */
/* eslint-disable no-bitwise */
import moment from "moment";
import padStart from "lodash.padstart";
import Firebase from "@react-native-firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as C from "../Config/constants";
import {
  RESET_SESSION, SET_FIELD_TIME, SET_FIELD_OTHER,
  SESSION_START, PAUSE_RECORDING, RESUME_RECORDING,
  STOP_RECORDING, SHOW_TIMER_BUTTON
} from "../Types";
import { LAST_PLAY_MODE_STORED } from "../Config/LocalStorage";

const roundedTime = (reference) => parseInt(((reference || Date.now()) / 1000), 10) * 1000;

export const start = (actionType, sessionType, session = {}) => {
  return (dispatch) => {
    Firebase.analytics().logEvent("log_session_start");

    dispatch({
      type: SESSION_START,
      payload: {
        actionType,
        sessionType,
        startedAt: session.startedAt || roundedTime(),
        resumedAt: session.startedAt || roundedTime(),
        ...(actionType === "manual" && { finishedAt: session.finishedAt || roundedTime() }),
        duration: 0,
        status: actionType === "manual" ? -1 : (session.status || 0)
      }
    });
  };
};

export const pause = (status, duration, resumedAt) => {
  return (dispatch) => {
    Firebase.analytics().logEvent("log_session_pause");

    dispatch({
      type: PAUSE_RECORDING,
      payload: {
        ...(status === 1 && { status: 2 }),
        ...(status === 1 && { duration: duration += (roundedTime() - resumedAt) / 1000 }),
        ...(status === 1 && { resumedAt: 0 })
      }
    });
  };
};

export const resume = (status) => {
  return (dispatch) => {
    Firebase.analytics().logEvent("log_session_resume");

    const validation = status === 2 || status === 3;

    dispatch({
      type: RESUME_RECORDING,
      payload: {
        ...(validation && { resumedAt: roundedTime() }),
        ...(validation && { status: 1 })
      }
    });

    // if (status === 2 || status === 3) {
    //   if (status === 3) {
    //     // COMBAK: this.showNotification();
    //   }
    //   this.resumedAt = this.roundedTime();
    //   this.status = 1;
    // }
  };
};

export const reset = (session = {}) => {
  Firebase.analytics().logEvent("log_session_reset");

  return (dispatch, getState) => {
    const { defaultSessionType } = getState().auth.profile;
    const { globalBreastType } = getState().logs;

    dispatch(
      {
        type: RESET_SESSION,
        payload: {
          lastTickedAt: null,
          key: session.key || null,
          sessionType:
            session.sessionType
            || defaultSessionType
            || "pump",
          createdAt: session.createdAt || null,
          resumedAt: session.finishedAt || null,
          startedAt: session.startedAt || null,
          finishedAt: session.finishedAt || null,
          notes: session.notes || null,
          breastType: session.breastType || globalBreastType,
          volume: session.volume || null,
          volumeBreastSide: session.volumeBreastSide || {
            left: 0,
            right: 0
          },
          duration: session.duration || 0,
          durationString: "",
          status: session.key ? -1 : 0
        }
      }
    );
  };
};

const parseDuration = (duration) => {
  const result = {};
  let durationMinutes = ~~(duration / 60) + "";
  if (isNaN(durationMinutes)) durationMinutes = "0";

  let durationSeconds = (duration % 60) + "";
  if (isNaN(durationSeconds)) durationSeconds = "0";

  result.durationMinutes = padStart(durationMinutes, 2, "0");
  result.durationSeconds = padStart(durationSeconds, 2, "0");

  durationMinutes = durationMinutes
    ? padStart(durationMinutes, 2, "0") + "m"
    : "";
  durationSeconds = padStart(durationSeconds, 2, "0") + "s";

  return durationMinutes + durationSeconds;
};

export const showTimerButton = (show) => {
  return (dispatch) => {
    dispatch({
      type: SHOW_TIMER_BUTTON,
      payload: { show }
    });
  };
};

export const stop = (status, duration, resumedAt) => {
  return (dispatch) => {
    // if (status === 1 || status === 2) {
    //   if (status === 1) {
    //     this.duration += (roundedTime() - resumedAt) / 1000;
    //   }
    //   this.status = 3;
    //   this.resumedAt = 0;
    //   // COMBAK: this.hideNotification();
    // }

    const validation1 = status === 1 || status === 2;
    const validation2 = status === 1;

    Firebase.analytics().logEvent("log_session_stop");

    dispatch({
      type: STOP_RECORDING,
      payload: {
        ...(validation1 && { status: 3 }),
        ...(validation1 && { resumedAt: 0 }),
        ...(validation1 && validation2
          && { duration: duration += (roundedTime() - resumedAt) / 1000 })
      }
    });
  };
};

export const setField = (field, value, startedAt, finishedAt) => {
  return (dispatch) => {
    if (field === C.SESSION_STARTED_AT || field === C.SESSION_FINISHED_AT) {
      const momentStartedAt = moment(
        field === C.SESSION_STARTED_AT ? value : startedAt,
        "x"
      );

      const momentFinishedAt = moment(
        field === C.SESSION_FINISHED_AT ? value : finishedAt,
        "x"
      );

      // momentFinishedAt
      //   .date(momentStartedAt.date())
      //   .month(momentStartedAt.month())
      //   .year(momentStartedAt.year());

      const startedAt1 = momentStartedAt.format("x") * 1;
      const finishedAt1 = momentFinishedAt.format("x") * 1;

      dispatch({
        type: SET_FIELD_TIME,
        payload: {
          startedAt: startedAt1,
          finishedAt: finishedAt1
        }
      });
    }

    dispatch({
      type: SET_FIELD_OTHER,
      payload: {
        ...(field === "volume" && { volume: value }),
        ...(field === "notes" && { notes: value }),
        ...(field === "breastType" && { breastType: value }),
        ...(field === "sessionType" && { sessionType: value }),
        ...(field === "volumeBreastSide" && { volumeBreastSide: value })
      }
    });
  };
};

export const validateSession = ({
  status, duration, actionType,
  key, startedAt, finishedAt,
  sessionType, notes, volume,
  breastType, uid, volumeBreastSideLeft,
  volumeBreastSideRight, sessionKind,
  createdAt, programId
}) => {
  return new Promise((resolve, reject) => {
    if (
      (status === 3 && duration) || status === -1 || actionType !== "record" // status what?
    ) {
      let key1 = key || `${startedAt}_session_${sessionType}`;
      const oldSessionType = key1.substr(key1.length - 4, 4);

      if (oldSessionType !== sessionType) {
        // Swapping between pump and feed session types
        key1 = key1.replace(oldSessionType, sessionType);
      }

      let finishedAt1 = finishedAt || roundedTime();

      if (startedAt > finishedAt1) {
        finishedAt1 = moment(finishedAt1).add(1, "days").valueOf();
      }

      const startedAtMoment = moment(startedAt, "x");
      const finishedAtMoment = moment(finishedAt1, "x");

      console.log("Session time:", startedAt, finishedAt1);
      if (moment(startedAt).isAfter(new Date(), "day")) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject("Date can't be in the future");
        return;
      }

      // totalDuration is used for manual and duration for recording
      let totalDuration = 0;

      if (sessionKind === "manual") {
        totalDuration = parseInt((finishedAt1 - startedAt) / 1000, 10);
      }

      const parsedVolume = Number(parseFloat(volume || 0).toFixed(2));
      const parsedVolumeLeft = Number(parseFloat(volumeBreastSideLeft || 0).toFixed(2));
      const parsedVolumeRight = Number(parseFloat(volumeBreastSideRight || 0).toFixed(2));

      const newDuration = (oldSessionType !== sessionType && sessionType === "pump") ? 0 : duration;
      const newTotalDuration = (oldSessionType !== sessionType && sessionType === "feed") ? 0 : totalDuration;

      const data = {
        key: key1,
        uid,
        type: "session",
        sessionType,
        createdAt: createdAt || null,
        notes,
        breastType,
        volume: breastType === C.BREAST_TYPE.both
          ? (parsedVolumeLeft + parsedVolumeRight)
          : parsedVolume,
        volumeBreastSide: breastType === C.BREAST_TYPE.both
          ? {
            left: parsedVolumeLeft,
            right: parsedVolumeRight
          }
          : {
            left: 0,
            right: 0,
          },
        startedAt,
        datestamp: startedAtMoment.format("YYYYMMDD"),
        hourstamp: startedAtMoment.format("YYYYMMDDHH"),
        finishedAt: finishedAt1,
        startedFinishedString:
          `${startedAtMoment.format("hh:mmA")} - ${finishedAtMoment.format("hh:mmA")}`,
        duration: newDuration,
        durationString: parseDuration(newDuration),
        totalDuration: newTotalDuration,
        totalDurationString: parseDuration(newTotalDuration),
        programId
      };

      Firebase.analytics().logEvent("log_session_update");
      resolve(data);
    } else {
      reject(new Error("Can't save this")); // What?
    }
  });
};

export const setLastPlayedMode = ({ id, programId }) => {
  const {
    LAST_PLAY_MODE: {
      MANUAL
    },
  } = C;
  if (id === MANUAL) {
    AsyncStorage.setItem(LAST_PLAY_MODE_STORED, JSON.stringify({
      playModeId: id
    }));
  } else {
    AsyncStorage.setItem(LAST_PLAY_MODE_STORED, JSON.stringify({
      playModeId: id, programId
    }));
  }
};
