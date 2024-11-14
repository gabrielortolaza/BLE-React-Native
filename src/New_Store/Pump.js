import firebase from "@react-native-firebase/app";
import {
  UPDATE_PUMP_STATUS, INITIAL_PROGRAM_STATE, PROGRAM_FROM_PUMP,
  SET_UP_PROGRAM, STOP_SESSION, UPDATE_PROGRAM_STATE,
  PUMP_TICK_TOCK, UPDATE_PROGRAM_TIMER, SET_CURRENT_PROGRAM,
  SET_CURRENT_SESSION, SET_CYCLE_INDEX, SET_VACUUM_INDEX,
  SPLIT_PROGRAM_STEP, SAVE_CHANGED_PROGRAM, SAVING_PROGRAM,
  DELETE_PROGRAM, UPDATE_CHANGED_PROGRAM, PUMP_DISCONNECTED,
  CLEAN_PROGRAM_UNMOUNT, UPDATE_PERIPHERALS, FW_UPDATE,
  UPDATE_APP_STATE, UPDATE_PUMP_RSSI, WATCHING_LOCATION,
  PROGRAM_RECONNECTED, UPDATE_PUMP_NAME, FOREGROUND_NOTIF_CHANNEL_ID
} from "../Types";
import * as C from "../Config/constants";
import { isGen2Pump } from "../Services/SharedFunctions";
import { LETDOWN, MODES } from "../Config/Modes";
import {
  setCycleIndex, setVacuumIndex, stopTimer,
  pauseSession
} from "../Actions/Pump";

const { DISCONNECTED } = C.CONNECT_STATUS;

const getImageCard = () => {
  /* * Assumimg user will make max 105 programs * */
  const imageCard = { manualRunImage: null };

  for (let i = 0; i < 105; i++) {
    imageCard[`programRunImage${i}`] = null;
  }
  return imageCard;
};

const initialState = {
  appState: "active", // App in background or foreground
  appStateDate: null, // Time appState is logged
  locationEnabled: true,
  watchingLocation: false,
  showPumpAdd: false,

  // BLE status
  id: null, // device id stored
  connectedId: null, // device Id connected
  updatePumpId: null,
  rssi: 0,
  pumpDevice: "", // non-editable device name connected
  pumpDeviceName: "", // editable device name. it can be for SuperGenie or 1st wearable pump
  isSG2: false,
  // TODO add new pump device name for 2nd wearable pump, i.e. pumpDeviceName2
  bleState: C.OFF, // mobile phone's bluetooth status on / off
  scanning: false,
  connectStatus: DISCONNECTED,
  peripherals: {},
  connectResponse: null,
  canReadChar6: false,
  updateAvailable: null,
  firmwareDownloadUrl: null,
  triggerSearch: true,

  // pump status
  boardVersion: null,
  firmwareVersion: null,
  playStatus: C.OP_STOP,
  speed: null,
  strength: null,
  mode: LETDOWN,
  battery: 0,
  light: C.LIGHT_OFF,
  programs: {},
  currentProgram: {},
  currentSession: {},
  programId: 0, // id of the program that is currently running
  programSeq: 0, // sequence of the session in program that is currently running
  minutes: 0,
  seconds: 0,
  programPlaying: false,
  programPaused: false,
  imageCard: getImageCard(),
  vacuumIndex: 0,
  cycleIndex: 0,
  vacuumOptions: [],
  cycleOptions: [],
  programFromPump: [],
  foregroundNotifChannId: C.FOREGROUND_SERVICE_PLAY_PROGRAM,
  activeProgram: {
    maxVacuumOptionArr: [],
    maxCycleOptionArr: [],
    paused: false, // When App pauses program for pause step
    hasPauseStep: false,
    currentTime: 0,
    totalTime: 0,
    currentIndex: 0,
    programDuration: 0,
    programAltered: false,
    newProgram: [],
    stoppedSessionRec: false,
    inPauseSeq: false,
    pauseSeqPassed: 0,
    playingProgram: false,
    timer: null,
    rezumeProgram: false,
    hasSequenced: false, // Has already changed sequence, maybe directly via pump or resuming after pause step
    carouselPosition: 0,
    startedProgramAt: null,
    endedProgramAt: null,
    programDisconnected: false
  }
};

export default function PumpReducer(state = initialState, action = {}) {
  /** Need this log to catch bugs in production */
  // console.log(state.connectStatus, "PumpStore:", action.type, action.payload);

  if (isGen2Pump(state.pumpDevice)) {
    if (action.type === PUMP_TICK_TOCK) {
      let { currentTime, totalTime } = state.activeProgram;

      currentTime += 1;
      totalTime += 1;

      // console.log("Tick..Tock", currentTime);

      action.payload.currentTime = currentTime;
      action.payload.totalTime = totalTime;
    }

    if (
      action.type === UPDATE_PUMP_STATUS
        && state.activeProgram.playingProgram
    ) {
      const { programSeq, playStatus } = action.payload;
      const { timer } = state.activeProgram;

      action.payload.activeProgram = {};

      if (Object.prototype.hasOwnProperty.call(action.payload, "programSeq") && state.programSeq !== programSeq) {
        action.payload.activeProgram.carouselPosition = programSeq;
        action.payload.activeProgram.currentIndex = programSeq;
        action.payload.activeProgram.currentTime = 0;
      }

      if (Object.prototype.hasOwnProperty.call(action.payload, "playStatus")) {
        // Stop timer if paused or stopped
        if (
          (playStatus === C.OP_STOP || playStatus === C.OP_PAUSE)
            && playStatus !== state.playStatus
        ) {
          if (timer) {
            stopTimer();
            action.payload.activeProgram.timer = null;
          }
        }

        // Stop listening to changes in pump if stopped
        if (playStatus === C.OP_STOP && playStatus !== state.playStatus) {
          action.payload.activeProgram.playingProgram = false;
          action.payload.activeProgram.currentTime = 0;
          action.payload.activeProgram.endedProgramAt = Date.now();
        }
      }
    }
  }

  if (state.pumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    // If disconnected while playing program
    if (
      action.type === PUMP_DISCONNECTED
        && state.activeProgram.playingProgram
    ) {
      const {
        appState, rssi, appStateDate,
        watchingLocation
      } = state;
      const { totalTime, programDuration, hasPauseStep } = state.activeProgram;

      action.payload.activeProgram = {};

      if (state.activeProgram.timer) {
        stopTimer();
        action.payload.activeProgram.timer = null;
      }

      // Stop listening
      action.payload.activeProgram.playingProgram = false;
      action.payload.activeProgram.programDisconnected = true;

      const programProgress = totalTime / programDuration;

      // If app was suspended by device
      const suspended = appStateDate ? (Date.now() - appStateDate > 25000) : false;
      let suspendedTime = 0;
      if (suspended) {
        suspendedTime = Date.now() - appStateDate;
      }

      // Log to Firebase
      firebase.analytics().logEvent("Program_disconnected", {
        appState,
        suspended,
        suspendedTime,
        hasPauseStep,
        totalTime,
        watchingLocation,
        totalTimeRound: Math.round(totalTime / 60) * 60,
        rssi,
        rssiCeil: Math.ceil(rssi / 10) * 10,
        programDuration,
        programDurationRound: Math.round(programDuration / 100) * 100,
        programProgress,
        programProgressRound: Math.round(programProgress * 10) / 10
      });
      // Log for debugging
      console.log("Program disconnected", totalTime, appState, rssi, programDuration, suspended, suspendedTime);
    }

    if (action.type === PUMP_TICK_TOCK) {
      const {
        newProgram, currentIndex, inPauseSeq,
        activePauseStep, pauseSeqPassed, hasSequenced
      } = state.activeProgram;
      let { currentTime, totalTime } = state.activeProgram;

      if (hasSequenced) {
        currentTime = 1;
        action.payload.hasSequenced = false;
      } else {
        currentTime += 1;
      }
      // console.log("Tick..Tock", currentTime);

      action.payload.currentTime = currentTime;

      if (!inPauseSeq) {
        totalTime += 1;
        action.payload.totalTime = totalTime;

        // Refresh totalTime with pump's time every 2 minutes
        // if (totalTime % 120 === 0) {
        //   console.log("Requesting App time refresh");
        //   requestStatus();
        // }
      }

      // If in pause sequence
      if (inPauseSeq) {
        // If time elapses
        if (currentTime >= activePauseStep.duration && newProgram.length > (currentIndex + 1)) {
          // Update data and UI
          action.payload.currentTime = 0;
          action.payload.inPauseSeq = false;
          action.payload.pauseSeqPassed = pauseSeqPassed + 1;
          action.payload.currentIndex = currentIndex + 1;
          action.payload.carouselPosition = currentIndex + pauseSeqPassed + 1;
          action.payload.paused = false;

          // Resume program
          action.payload.rezumeProgram = true;
        }
      }
    }

    if (
      action.type === UPDATE_PUMP_STATUS
        && state.activeProgram.playingProgram
    ) {
      const {
        playStatus, programSeq, speed,
        strength, minutes, seconds
      } = action.payload;
      const {
        cycleIndex, vacuumIndex, vacuumOptions,
        cycleOptions
      } = state;
      const {
        timer, inPauseSeq, paused,
        newProgram, modeId
      } = state.activeProgram;

      if (!action.payload.activeProgram) {
        action.payload.activeProgram = {};
      }

      if (Object.prototype.hasOwnProperty.call(action.payload, "playStatus")) {
        // Stop timer if paused or stopped
        if (
          (playStatus === C.OP_STOP || playStatus === C.OP_PAUSE) && !inPauseSeq
          && playStatus !== state.playStatus
        ) {
          if (timer) {
            stopTimer();
            action.payload.activeProgram.timer = null;
          }
        }

        // Stop listening to changes in pump if stopped
        if (playStatus === C.OP_STOP) {
          action.payload.activeProgram.playingProgram = false;
          action.payload.activeProgram.currentTime = 0;
          action.payload.activeProgram.endedProgramAt = Date.now();
        }
      }

      // Whenever pump time is received
      if (Object.prototype.hasOwnProperty.call(action.payload, "minutes")) {
        // Update total time when sequence changes
        // console.log("Refreshing App time");
        action.payload.activeProgram.totalTime = (minutes * 60) + seconds;
      }

      // When program sequence changes
      if (Object.prototype.hasOwnProperty.call(action.payload, "programSeq") && state.programSeq !== programSeq && programSeq !== undefined) {
        const { pauseSeqPassed } = state.activeProgram;

        action.payload.activeProgram.carouselPosition = programSeq
          + (programSeq === 0 ? 0 : pauseSeqPassed); // Can't have passed if === 0
        if (!paused && playStatus !== C.OP_PAUSE) {
          // If program wasn't just paused
          action.payload.activeProgram.hasSequenced = true;
          action.payload.activeProgram.currentIndex = programSeq;

          // Check to see if sequence is on pause sequence
          // let trueIndex;
          // newProgram.forEach((x) => {
          //   if (x.originalIndex === programSeq) {
          //     // eslint-disable-next-line no-unused-vars
          //     trueIndex = x.index;
          //   }
          // });

          // console.log("Yeck:", JSON.stringify(newProgram), pauseSeq);
          if (
            newProgram[programSeq + pauseSeqPassed]
              && newProgram[programSeq + pauseSeqPassed].pause
          ) {
            // ...update current time and index

            action.payload.activeProgram.currentTime = 0;
            action.payload.activeProgram.currentIndex = programSeq;
            action.payload.activeProgram.activePauseStep = {
              index: newProgram[programSeq + pauseSeqPassed].index,
              duration: newProgram[programSeq + pauseSeqPassed].duration
            };
            action.payload.activeProgram.paused = true;
            action.payload.activeProgram.inPauseSeq = true;
            pauseSession(null, true);
          }
        } else if (paused && playStatus !== C.OP_PAUSE) {
          // Change paused state when pump no longer paused
          action.payload.activeProgram.paused = false;
        }
      }

      if (Object.prototype.hasOwnProperty.call(action.payload, "mode") && action.payload.mode) {
        const { mode } = action.payload;

        // If mode has changed
        if (modeId !== mode) {
          // Set new mode
          action.payload.activeProgram.modeId = mode;
        }
      }

      if (Object.prototype.hasOwnProperty.call(action.payload, "speed") && action.payload.speed) {
        const { mode } = state;
        // If speed changed set new speed index
        if (speed !== cycleOptions[cycleIndex] && MODES[mode]) {
          const obj = setCycleIndex(MODES[mode].cycle[0]
            .findIndex((c) => c === speed), mode);

          const temp1 = Object.keys(obj);
          const temp2 = Object.values(obj);

          for (let i = 0; i < temp1.length; i++) {
            action.payload[temp1[i]] = temp2[i];
          }
        }
      }

      if (Object.prototype.hasOwnProperty.call(action.payload, "strength") && action.payload.strength) {
        const { mode } = state;
        // If strength changed set new strength index
        if (strength !== vacuumOptions[vacuumIndex]) {
          const obj = setVacuumIndex((MODES[mode].vacuum[0])
            .findIndex((c) => c === strength), mode);

          const temp1 = Object.keys(obj);
          const temp2 = Object.values(obj);

          for (let i = 0; i < temp1.length; i++) {
            action.payload[temp1[i]] = temp2[i];
          }
        }
      }
    }
  }

  // console.log("PumpStore2:", state);
  switch (action.type) {
    case UPDATE_PUMP_STATUS:
      // console.log("updating pump status:", action.payload);
      return {
        ...state,
        ...action.payload,
        activeProgram: {
          ...state.activeProgram,
          ...action.payload.activeProgram
        }
      };
    case UPDATE_PUMP_NAME:
      return {
        ...state,
        pumpDeviceName: action.payload.pumpDeviceName,
      };
    case UPDATE_PERIPHERALS:
      return {
        ...state,
        peripherals: action.payload.peripherals
      };
    case SAVING_PROGRAM || DELETE_PROGRAM:
      return {
        ...state,
        programs: action.payload.programs
      };
    case SET_CURRENT_PROGRAM:
      return {
        ...state,
        currentProgram: action.payload.currentProgram
      };
    case SET_CURRENT_SESSION:
      return {
        ...state,
        currentSession: action.payload.currentSession
      };
    case SET_CYCLE_INDEX:
      return {
        ...state,
        cycleIndex: action.payload.cycleIndex,
        vacuumIndex: action.payload.vacuumIndex,
        vacuumOptions: action.payload.vacuumOptions,
        activeProgram: {
          ...state.activeProgram
        }
      };
    case SET_VACUUM_INDEX:
      return {
        ...state,
        ...(Object.prototype.hasOwnProperty.call(action.payload, "cycleIndex")
            && { cycleIndex: action.payload.cycleIndex }),
        vacuumIndex: action.payload.vacuumIndex,
        cycleOptions: action.payload.cycleOptions,
        activeProgram: {
          ...state.activeProgram,
        }
      };
    case UPDATE_CHANGED_PROGRAM:
      return {
        ...state,
        activeProgram: {
          ...state.activeProgram,
          stoppedSessionRec: action.payload.stoppedSessionRec,
          programAltered: action.payload.programAltered
        }
      };
    case SAVE_CHANGED_PROGRAM:
      return {
        ...state,
        programs: action.payload.programs
      };
    case SPLIT_PROGRAM_STEP:
      return {
        ...state,
        activeProgram: {
          ...state.activeProgram,
          newProgram: action.payload.newProgram,
          currentIndex: action.payload.currentIndex,
          carouselPosition: state.activeProgram.carouselPosition + 1,
          ...(Object.prototype.hasOwnProperty.call(action.payload, "alteredProgramId")
            && { alteredProgramId: action.payload.alteredProgramId })
        }
      };
    case UPDATE_PROGRAM_TIMER:
      return {
        ...state,
        activeProgram: {
          ...state.activeProgram,
          ...(Object.prototype.hasOwnProperty.call(action.payload, "timer")
            && { timer: action.payload.timer }),
          ...(Object.prototype.hasOwnProperty.call(action.payload, "totalTime")
            && { totalTime: action.payload.totalTime }),
          ...(Object.prototype.hasOwnProperty.call(action.payload, "startedProgramAt")
            && { startedProgramAt: action.payload.startedProgramAt }),
          ...(Object.prototype.hasOwnProperty.call(action.payload, "endedProgramAt")
            && { endedProgramAt: action.payload.endedProgramAt }),
          ...(Object.prototype.hasOwnProperty.call(action.payload, "playingProgram")
            && { playingProgram: action.payload.playingProgram }),
          ...(Object.prototype.hasOwnProperty.call(action.payload, "rezumeProgram")
            && { rezumeProgram: action.payload.rezumeProgram })
        }
      };
    case UPDATE_PROGRAM_STATE:
      return {
        ...state,
        activeProgram: {
          ...state.activeProgram,
          ...action.payload
        }
      };
    case INITIAL_PROGRAM_STATE:
      return {
        ...state,
        activeProgram: {
          ...state.activeProgram,
          modeId: action.payload.modeId
        },
      };
    case SET_UP_PROGRAM:
      return {
        ...state,
        mode: action.payload.modeId,
        ...(Object.prototype.hasOwnProperty.call(action.payload, "cycleIndex")
            && { cycleIndex: action.payload.cycleIndex }),
        vacuumIndex: action.payload.vacuumIndex,
        vacuumOptions: action.payload.vacuumOptions,
        cycleOptions: action.payload.cycleOptions,
        activeProgram: {
          ...initialState.activeProgram,
          currentTime: action.payload.currentTime,
          programDuration: action.payload.programDuration,
          modeId: action.payload.modeId,
          newProgram: action.payload.newProgram,
          hasPauseStep: action.payload.hasPauseStep,
          pauseSeq: action.payload.pauseSeq,
          maxVacuumOptionArr: action.payload.maxVacuumOptionArr,
          maxCycleOptionArr: action.payload.maxCycleOptionArr,
          totalTime: action.payload.totalTime,
          programAltered: false,
          playingProgram: false,
          pauseSeqPassed: 0,
          paused: false,
          currentIndex: 0,
          stoppedSessionRec: false,
          inPauseSeq: false,
          timer: null,
          rezumeProgram: false,
          hasSequenced: false,
          carouselPosition: 0,
          programDisconnected: false
        }
      };
    case PUMP_TICK_TOCK:
      return {
        ...state,
        ...(Object.prototype.hasOwnProperty.call(action.payload, "vacuumOptions")
            && { vacuumOptions: action.payload.vacuumOptions }),
        ...(Object.prototype.hasOwnProperty.call(action.payload, "cycleOptions")
            && { cycleOptions: action.payload.cycleOptions }),
        activeProgram: {
          ...state.activeProgram,
          ...action.payload
        }
      };
    case STOP_SESSION:
      return {
        ...state,
        activeProgram: {
          ...state.activeProgram,
          ...(Object.prototype.hasOwnProperty.call(action.payload, "timer")
            && { timer: action.payload.timer }),
          playingProgram: action.payload.playingProgram,
          ...(Object.prototype.hasOwnProperty.call(action.payload, "stoppedSessionRec")
            && { stoppedSessionRec: action.payload.stoppedSessionRec }),
          ...(Object.prototype.hasOwnProperty.call(action.payload, "totalTime")
            && { totalTime: action.payload.totalTime })
        }
      };
    case PUMP_DISCONNECTED:
      return {
        ...state,
        ...action.payload,
        activeProgram: {
          ...state.activeProgram,
          ...action.payload.activeProgram
        }
      };
    case PROGRAM_RECONNECTED:
      return {
        ...state,
        activeProgram: {
          ...state.activeProgram,
          programDisconnected: false,
          ...(Object.prototype.hasOwnProperty.call(action.payload, "playingProgram")
          && { playingProgram: action.payload.playingProgram })
        }
      };
    case CLEAN_PROGRAM_UNMOUNT:
      return {
        ...state,
        activeProgram: {
          ...state.activeProgram,
          carouselPosition: 0,
          ...(Object.prototype.hasOwnProperty.call(action.payload, "totalTime")
          && { totalTime: action.payload.totalTime })
        }
      };
    case FW_UPDATE:
      return {
        ...state,
        updateAvailable: action.payload.updateAvailable,
        updatePumpId: action.payload.updatePumpId,
        firmwareDownloadUrl: action.payload.firmwareDownloadUrl
      };
    case UPDATE_APP_STATE:
      return {
        ...state,
        appState: action.payload.appState,
        appStateDate: Date.now()
      };
    case UPDATE_PUMP_RSSI:
      return {
        ...state,
        rssi: action.payload.rssi
      };
    case PROGRAM_FROM_PUMP:
      return {
        ...state,
        programFromPump: action.payload
      };
    case WATCHING_LOCATION:
      return {
        ...state,
        watchingLocation: action.payload
      };
    case FOREGROUND_NOTIF_CHANNEL_ID:
      return {
        ...state,
        foregroundNotifChannId: action.payload
      };
    default:
      return state;
  }
}
